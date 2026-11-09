"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { JOURNAL_CATEGORY_MAX } from "@/lib/domain/journal";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { SLUG_PATTERN, slugify } from "@/lib/domain/slug";
import { prisma } from "@/lib/prisma";

export type ActionState = { error: string | null };

const LIST_PATH = "/admin/journal/categories";

export async function listJournalCategories() {
  await requireRole(CONTENT_ROLES);
  return prisma.journalCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { posts: true } } },
  });
}

export async function getJournalCategory(id: string) {
  await requireRole(CONTENT_ROLES);
  return prisma.journalCategory.findUnique({
    where: { id },
    include: { _count: { select: { posts: true } } },
  });
}

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi.")
    .max(JOURNAL_CATEGORY_MAX, `Nama maksimal ${JOURNAL_CATEGORY_MAX} karakter.`),
  slug: z
    .string()
    .trim()
    .max(80, "Slug maksimal 80 karakter.")
    .optional(),
  sortOrder: z.coerce.number().int().min(0, "Urutan tidak boleh negatif.").default(0),
  isPublished: z.boolean(),
});

/**
 * Kategori ikut menentukan chip filter di /our-story/journal dan label di
 * kartu artikel, jadi daftar artikel publik ikut disegarkan.
 */
function revalidateJournalCategories() {
  updateTag(CONTENT_TAGS.journal);
  revalidatePath(LIST_PATH);
  revalidatePath("/admin/journal");
  revalidatePath("/our-story/journal");
}

export async function saveJournalCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") ?? undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  const input = parsed.data;

  // Slug kosong dibuat dari nama, supaya admin tidak wajib memikirkannya.
  const slug = (input.slug || slugify(input.name)).trim();
  if (!SLUG_PATTERN.test(slug)) {
    return { error: "Slug hanya boleh huruf kecil, angka, dan tanda hubung." };
  }

  const [slugClash, nameClash] = await Promise.all([
    prisma.journalCategory.findFirst({
      where: { slug, ...(id ? { NOT: { id } } : {}) },
      select: { id: true },
    }),
    // Nama yang sama beda huruf besar/kecil tetap dianggap kategori yang sama.
    prisma.journalCategory.findFirst({
      where: { name: { equals: input.name, mode: "insensitive" }, ...(id ? { NOT: { id } } : {}) },
      select: { name: true },
    }),
  ]);
  if (slugClash) return { error: `Slug "${slug}" sudah dipakai kategori lain.` };
  if (nameClash) return { error: `Kategori "${nameClash.name}" sudah ada.` };

  const data = {
    name: input.name,
    slug,
    sortOrder: input.sortOrder,
    isPublished: input.isPublished,
  };

  if (id) {
    const previous = await prisma.journalCategory.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!previous) return { error: "Kategori tidak ditemukan. Mungkin sudah dihapus." };
    await prisma.journalCategory.update({ where: { id }, data });
  } else {
    await prisma.journalCategory.create({ data });
  }

  revalidateJournalCategories();
  redirect(`${LIST_PATH}?saved=1`);
}

/**
 * Menghapus kategori tidak menghapus artikelnya: relasi `onDelete: SetNull`
 * membuat artikel kehilangan kategori, bukan hilang dari situs. Tombol hapus
 * tetap disembunyikan bila masih dipakai; ini penjaganya di server.
 */
export async function deleteJournalCategoryAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const category = await prisma.journalCategory.findUnique({
    where: { id },
    include: { _count: { select: { posts: true } } },
  });
  if (!category) redirect(LIST_PATH);
  if (category._count.posts > 0) redirect(`${LIST_PATH}/${id}?notEmpty=1`);

  await prisma.journalCategory.delete({ where: { id } });
  revalidateJournalCategories();
  redirect(`${LIST_PATH}?deleted=1`);
}

/** Geser satu kategori ke atas/bawah dengan menukar sortOrder tetangganya. */
export async function moveJournalCategoryAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) redirect(LIST_PATH);

  const all = await prisma.journalCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true },
  });
  const index = all.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= all.length) redirect(LIST_PATH);

  // sortOrder ditulis ulang berurutan supaya nilai duplikat dari impor lama
  // tidak membuat urutan tidak bisa digeser.
  const reordered = [...all];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(target, 0, moved!);

  await prisma.$transaction(
    reordered.map((row, order) =>
      prisma.journalCategory.update({ where: { id: row.id }, data: { sortOrder: order } }),
    ),
  );

  revalidateJournalCategories();
  redirect(LIST_PATH);
}
