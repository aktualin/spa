"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { LIST_PATH, revalidateJournalCategories } from "./journal-categories.helpers";

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