"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { recordPathMoves, treatmentPath } from "@/lib/path-moves";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

const CONTENT_ROLES = ["ADMIN", "EDITOR"] as const;

export type ActionState = { error: string | null; ok?: boolean };

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionSchema = z.object({
  label: z.string().trim().min(1, "Label durasi wajib diisi."),
  durationMin: z.coerce
    .number()
    .int("Durasi harus bilangan bulat.")
    .positive("Durasi harus lebih dari 0 menit."),
  priceIdr: z.coerce
    .number()
    .int("Harga harus bilangan bulat rupiah.")
    .min(0, "Harga tidak boleh negatif."),
});

const treatmentSchema = z.object({
  name: z.string().trim().min(1, "Nama treatment wajib diisi."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .regex(slugPattern, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  categoryId: z.string().trim().min(1, "Kategori wajib dipilih."),
  tagline: z.string().trim().max(160, "Tagline maksimal 160 karakter.").optional(),
  description: z.string().trim().optional(),
  note: z.string().trim().max(200, "Catatan maksimal 200 karakter.").optional(),
  addonSection: z.enum(["BODY", "FACE", "HEAD_SCALP", "BATH"]).optional(),
  // Hanya URL yang disimpan; file-nya ada di Supabase Storage.
  imageUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  whatsappMessage: z.string().trim().optional(),
  // Dipakai halaman /treatments/[kategori]/[slug]; kosong = pakai default.
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isNew: z.boolean(),
  isBestSeller: z.boolean(),
  isPublished: z.boolean(),
  options: z.array(optionSchema).min(1, "Minimal satu opsi durasi & harga."),
});

/** Form mengirim opsi sebagai options[0][label], options[0][durationMin], dst. */
function parseOptions(formData: FormData) {
  const rows = new Map<number, Record<string, string>>();

  for (const [key, value] of formData.entries()) {
    const match = /^options\[(\d+)]\[(\w+)]$/.exec(key);
    if (!match) continue;
    const index = Number(match[1]);
    const row = rows.get(index) ?? {};
    row[match[2]] = String(value);
    rows.set(index, row);
  }

  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, row]) => row)
    // Baris yang seluruhnya kosong dianggap dihapus oleh admin.
    .filter((row) => row.label?.trim() || row.priceIdr?.trim());
}

function readForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    tagline: formData.get("tagline") ?? undefined,
    description: formData.get("description") ?? undefined,
    note: formData.get("note") ?? undefined,
    addonSection: String(formData.get("addonSection") ?? "") || undefined,
    imageUrl: formData.get("imageUrl") ?? undefined,
    whatsappMessage: formData.get("whatsappMessage") ?? undefined,
    seoTitle: formData.get("seoTitle") ?? undefined,
    seoDescription: formData.get("seoDescription") ?? undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    isNew: formData.get("isNew") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
    isPublished: formData.get("isPublished") === "on",
    options: parseOptions(formData),
  };
}

function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue?.message ?? "Input tidak valid.";
}

export async function saveTreatmentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const parsed = treatmentSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { options, imageUrl, seoTitle, seoDescription, tagline, note, addonSection, ...rest } =
    parsed.data;

  const category = await prisma.treatmentCategory.findUnique({
    where: { id: rest.categoryId },
    select: { slug: true, kind: true, isPublished: true },
  });
  if (!category) return { error: "Kategori tidak ditemukan." };
  if (category.kind === "ADDON" && !addonSection) {
    return { error: "Pilih letak add-on di halaman Menu (Body, Face, Head & Scalp, atau Bath)." };
  }

  // Field opsional yang dikosongkan admin disimpan sebagai NULL, bukan "".
  const data = {
    ...rest,
    imageUrl: imageUrl ? imageUrl : null,
    seoTitle: seoTitle ? seoTitle : null,
    seoDescription: seoDescription ? seoDescription : null,
    tagline: tagline ? tagline : null,
    note: note ? note : null,
    // Letak di /menu hanya berarti untuk add-on.
    addonSection: category.kind === "ADDON" ? (addonSection ?? null) : null,
  };

  // Slug dipakai di URL publik, jadi harus unik lintas treatment.
  const clash = await prisma.treatment.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Slug "${data.slug}" sudah dipakai treatment lain.` };
  }

  // Gambar lama yang diganti/dihapus ikut dibuang dari bucket supaya tidak
  // menumpuk file yatim. Kegagalan hapus tidak boleh menggagalkan simpan.
  const previous = id
    ? await prisma.treatment.findUnique({
        where: { id },
        select: {
          imageUrl: true,
          slug: true,
          isPublished: true,
          category: { select: { slug: true, isPublished: true } },
        },
      })
    : null;
  if (previous?.imageUrl && previous.imageUrl !== data.imageUrl) {
    await deleteImageByUrl(previous.imageUrl).catch(() => {});
  }

  const treatment = id
    ? await prisma.treatment.update({ where: { id }, data })
    : await prisma.treatment.create({ data });

  // Opsi harga ditulis ulang utuh — lebih sederhana dan aman daripada
  // melacak baris mana yang dihapus/ditambah di form.
  await prisma.treatmentOption.deleteMany({
    where: { treatmentId: treatment.id },
  });
  await prisma.treatmentOption.createMany({
    data: options.map((option, index) => ({
      ...option,
      treatmentId: treatment.id,
      sortOrder: index,
    })),
  });

  // URL publik lama tetap hidup (301) bila slug atau kategorinya berubah.
  const wasPublic = previous?.isPublished && previous.category.isPublished;
  const redirectsChanged =
    previous && wasPublic
      ? await recordPathMoves(
          prisma,
          [
            {
              from: treatmentPath(previous.category.slug, previous.slug),
              to: treatmentPath(category.slug, treatment.slug),
            },
          ],
          `Treatment "${treatment.name}" pindah alamat`,
        )
      : false;

  revalidateCatalog(redirectsChanged);
  revalidatePath(`/menu/${treatment.slug}`);

  redirect(
    category.kind === "ADDON" ? "/admin/treatments/addons?saved=1" : "/admin/treatments?saved=1",
  );
}

function revalidateCatalog(redirectsChanged: boolean) {
  updateTag(CONTENT_TAGS.catalog);
  if (redirectsChanged) {
    updateTag(CONTENT_TAGS.redirects);
    revalidatePath("/admin/redirects");
  }
  revalidatePath("/admin/treatments");
  revalidatePath("/admin/treatments/addons");
  revalidatePath("/menu");
  revalidatePath("/treatments");
  revalidatePath("/sitemap.xml");
}

export async function deleteTreatmentAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const treatment = await prisma.treatment.delete({
    where: { id },
    include: { category: { select: { kind: true } } },
  });
  if (treatment.imageUrl) {
    await deleteImageByUrl(treatment.imageUrl).catch(() => {});
  }

  revalidateCatalog(false);
  redirect(
    treatment.category.kind === "ADDON"
      ? "/admin/treatments/addons?deleted=1"
      : "/admin/treatments?deleted=1",
  );
}

/** Dipakai halaman list; read-only tapi tetap butuh sesi. */
export async function listTreatmentsByCategory(kind: "TREATMENT" | "ADDON" = "TREATMENT") {
  await requireSession();

  return prisma.treatmentCategory.findMany({
    where: { kind },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      treatments: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { options: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}
