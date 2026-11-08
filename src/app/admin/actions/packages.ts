"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  InvalidPriceError,
  parseDurationMin,
  parsePriceIdr,
} from "@/lib/domain/pricing";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { SLUG_PATTERN } from "@/lib/domain/slug";
import { packagePath, recordPathMoves } from "@/lib/path-moves";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

export type ActionState = { error: string | null; ok?: boolean };

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null));

const packageSchema = z.object({
  name: z.string().trim().min(1, "Nama package wajib diisi."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .regex(SLUG_PATTERN, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  subtitle: optionalText,
  quote: optionalText,
  description: optionalText,
  // Hanya URL yang disimpan; file-nya ada di Supabase Storage.
  imageUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  priceIdr: z.string().trim(),
  durationMin: z.string().trim(),
  durationLabel: optionalText,
  sortOrder: z.coerce.number().int().min(0).default(0),
  isNew: z.boolean(),
  isBestSeller: z.boolean(),
  isPublished: z.boolean(),
  seoTitle: optionalText,
  seoDescription: optionalText,
  whatsappMessage: optionalText,
});

type ItemRow = { treatmentId: string | null; label: string | null; minutes: number | null };

/**
 * Form mengirim item sebagai items[0][treatmentId], items[0][label], dst.
 * Baris tanpa treatment dan tanpa label dianggap dihapus oleh admin.
 */
function parseItems(formData: FormData): ItemRow[] {
  const rows = new Map<number, Record<string, string>>();

  for (const [key, value] of formData.entries()) {
    const match = /^items\[(\d+)]\[(\w+)]$/.exec(key);
    if (!match) continue;
    const index = Number(match[1]);
    const row = rows.get(index) ?? {};
    row[match[2]] = String(value);
    rows.set(index, row);
  }

  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, row]) => {
      const minutes = Number.parseInt(row.minutes ?? "", 10);
      return {
        treatmentId: row.treatmentId?.trim() || null,
        label: row.label?.trim() || null,
        minutes: Number.isFinite(minutes) && minutes > 0 ? minutes : null,
      };
    })
    .filter((row) => row.treatmentId || row.label);
}

function readForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    subtitle: formData.get("subtitle") ?? undefined,
    quote: formData.get("quote") ?? undefined,
    description: formData.get("description") ?? undefined,
    imageUrl: formData.get("imageUrl") ?? undefined,
    priceIdr: formData.get("priceIdr") ?? "",
    durationMin: formData.get("durationMin") ?? "",
    durationLabel: formData.get("durationLabel") ?? undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    isNew: formData.get("isNew") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
    isPublished: formData.get("isPublished") === "on",
    seoTitle: formData.get("seoTitle") ?? undefined,
    seoDescription: formData.get("seoDescription") ?? undefined,
    whatsappMessage: formData.get("whatsappMessage") ?? undefined,
  };
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}

function revalidatePackages(slug?: string, redirectsChanged = false) {
  updateTag(CONTENT_TAGS.catalog);
  if (redirectsChanged) {
    updateTag(CONTENT_TAGS.redirects);
    revalidatePath("/admin/redirects");
  }
  revalidatePath("/admin/treatments/packages");
  revalidatePath("/admin/treatments/prices");
  revalidatePath("/treatments/packages");
  revalidatePath("/menu");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/treatments/packages/${slug}`);
}

export async function savePackageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const parsed = packageSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { priceIdr: rawPrice, durationMin: rawDuration, imageUrl, ...rest } =
    parsed.data;

  let priceIdr: number;
  let durationMin: number | null;
  try {
    priceIdr = parsePriceIdr(rawPrice);
    // Durasi package opsional — kosong berarti tidak ditampilkan.
    durationMin = rawDuration ? parseDurationMin(rawDuration) : null;
  } catch (error) {
    if (error instanceof InvalidPriceError) return { error: error.message };
    throw error;
  }

  const items = parseItems(formData);

  // Treatment yang dipilih harus benar-benar ada (mencegah id palsu dari client).
  const treatmentIds = [
    ...new Set(items.flatMap((item) => (item.treatmentId ? [item.treatmentId] : []))),
  ];
  if (treatmentIds.length > 0) {
    const found = await prisma.treatment.count({
      where: { id: { in: treatmentIds } },
    });
    if (found !== treatmentIds.length) {
      return { error: "Ada treatment yang dipilih sudah tidak tersedia." };
    }
  }

  const data = {
    ...rest,
    priceIdr,
    durationMin,
    imageUrl: imageUrl ? imageUrl : null,
  };

  // Slug dipakai di URL publik, jadi harus unik lintas package.
  const clash = await prisma.package.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Slug "${data.slug}" sudah dipakai package lain.` };
  }

  let previousSlug: string | undefined;
  let wasPublished = false;
  if (id) {
    const previous = await prisma.package.findUnique({
      where: { id },
      select: { imageUrl: true, slug: true, isPublished: true },
    });
    if (!previous) return { error: "Package tidak ditemukan." };
    previousSlug = previous.slug;
    wasPublished = previous.isPublished;
    // Gambar lama yang diganti/dihapus ikut dibuang dari bucket.
    if (previous.imageUrl && previous.imageUrl !== data.imageUrl) {
      await deleteImageByUrl(previous.imageUrl).catch(() => {});
    }
  }

  const { pkg, redirectsChanged } = await prisma.$transaction(async (tx) => {
    const saved = id
      ? await tx.package.update({ where: { id }, data })
      : await tx.package.create({ data });

    // Item ditulis ulang utuh, sama seperti opsi harga di treatment.
    await tx.packageItem.deleteMany({ where: { packageId: saved.id } });
    if (items.length > 0) {
      await tx.packageItem.createMany({
        data: items.map((item, index) => ({
          packageId: saved.id,
          treatmentId: item.treatmentId,
          label: item.label,
          minutes: item.minutes,
          sortOrder: index,
        })),
      });
    }

    // Alamat lama package yang sudah tayang tetap hidup lewat 301.
    const moved =
      wasPublished && previousSlug
        ? await recordPathMoves(
            tx,
            [{ from: packagePath(previousSlug), to: packagePath(saved.slug) }],
            `Slug package "${saved.name}" diubah`,
          )
        : false;
    return { pkg: saved, redirectsChanged: moved };
  });

  revalidatePackages(pkg.slug, redirectsChanged);
  if (previousSlug && previousSlug !== pkg.slug) {
    revalidatePath(`/treatments/packages/${previousSlug}`);
  }

  redirect("/admin/treatments/packages?saved=1");
}

export async function deletePackageAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const pkg = await prisma.package.delete({ where: { id } });
  if (pkg.imageUrl) {
    await deleteImageByUrl(pkg.imageUrl).catch(() => {});
  }

  revalidatePackages(pkg.slug);
  redirect("/admin/treatments/packages?deleted=1");
}

/** Dipakai halaman list; read-only tapi tetap butuh sesi. */
export async function listPackages() {
  await requireSession();

  return prisma.package.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: { treatment: { select: { name: true } } },
      },
    },
  });
}
