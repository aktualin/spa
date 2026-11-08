"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { SLUG_PATTERN } from "@/lib/domain/slug";
import { categoryPath, recordPathMoves, treatmentPath, type PathMove } from "@/lib/path-moves";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

export type ActionState = { error: string | null };

export async function listCategories() {
  await requireRole(CONTENT_ROLES);
  return prisma.treatmentCategory.findMany({
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { treatments: true } } },
  });
}

export async function getCategory(id: string) {
  await requireRole(CONTENT_ROLES);
  return prisma.treatmentCategory.findUnique({
    where: { id },
    include: { _count: { select: { treatments: true } } },
  });
}

const categorySchema = z.object({
  name: z.string().trim().min(1, "Nama kategori wajib diisi.").max(80),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .max(80, "Slug maksimal 80 karakter.")
    .regex(SLUG_PATTERN, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  kind: z.enum(["TREATMENT", "ADDON"]),
  description: z.string().trim().max(2000).optional(),
  imageUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  sortOrder: z.coerce.number().int().min(0, "Urutan tidak boleh negatif.").default(0),
  isPublished: z.boolean(),
  seoTitle: z.string().trim().max(70, "Meta title maksimal 70 karakter.").optional(),
  seoDescription: z.string().trim().max(200, "Meta description maksimal 200 karakter.").optional(),
});

function revalidateCategories(redirectsChanged: boolean) {
  updateTag(CONTENT_TAGS.catalog);
  if (redirectsChanged) {
    updateTag(CONTENT_TAGS.redirects);
    revalidatePath("/admin/redirects");
  }
  revalidatePath("/admin/treatments");
  revalidatePath("/admin/treatments/addons");
  revalidatePath("/admin/treatments/categories");
  revalidatePath("/menu");
  revalidatePath("/treatments");
  revalidatePath("/sitemap.xml");
}

export async function saveCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    kind: formData.get("kind"),
    description: formData.get("description") ?? undefined,
    imageUrl: formData.get("imageUrl") ?? undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    isPublished: formData.get("isPublished") === "on",
    seoTitle: formData.get("seoTitle") ?? undefined,
    seoDescription: formData.get("seoDescription") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  const input = parsed.data;

  // "packages" adalah segmen tetap /treatments/packages.
  if (input.slug === "packages") {
    return { error: 'Slug "packages" dipakai halaman Packages. Pilih slug lain.' };
  }

  const clash = await prisma.treatmentCategory.findFirst({
    where: { slug: input.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return { error: `Slug "${input.slug}" sudah dipakai kategori lain.` };

  const data = {
    name: input.name,
    slug: input.slug,
    kind: input.kind,
    description: input.description || null,
    imageUrl: input.imageUrl || null,
    sortOrder: input.sortOrder,
    isPublished: input.isPublished,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
  };

  if (!id) {
    await prisma.treatmentCategory.create({ data });
    revalidateCategories(false);
    redirect("/admin/treatments/categories?saved=1");
  }

  const previous = await prisma.treatmentCategory.findUnique({
    where: { id },
    include: { treatments: { where: { isPublished: true }, select: { slug: true } } },
  });
  if (!previous) return { error: "Kategori tidak ditemukan. Mungkin sudah dihapus." };

  if (previous.imageUrl && previous.imageUrl !== data.imageUrl) {
    await deleteImageByUrl(previous.imageUrl).catch(() => {});
  }

  const redirectsChanged = await prisma.$transaction(async (tx) => {
    await tx.treatmentCategory.update({ where: { id }, data });
    if (!previous.isPublished || previous.slug === data.slug) return false;
    // Halaman kategori dan setiap treatment di dalamnya ikut pindah alamat.
    const moves: PathMove[] = [
      { from: categoryPath(previous.slug), to: categoryPath(data.slug) },
      ...previous.treatments.map((t) => ({
        from: treatmentPath(previous.slug, t.slug),
        to: treatmentPath(data.slug, t.slug),
      })),
    ];
    return recordPathMoves(tx, moves, `Slug kategori "${data.name}" diubah`);
  });

  revalidateCategories(redirectsChanged);
  redirect("/admin/treatments/categories?saved=1");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const category = await prisma.treatmentCategory.findUnique({
    where: { id },
    include: { _count: { select: { treatments: true } } },
  });
  if (!category) redirect("/admin/treatments/categories");
  // Tombol hapus sudah disembunyikan bila masih ada isi; ini penjaga di server.
  if (category._count.treatments > 0) redirect(`/admin/treatments/categories/${id}?notEmpty=1`);

  await prisma.treatmentCategory.delete({ where: { id } });
  if (category.imageUrl) await deleteImageByUrl(category.imageUrl).catch(() => {});

  revalidateCategories(false);
  redirect("/admin/treatments/categories?deleted=1");
}
