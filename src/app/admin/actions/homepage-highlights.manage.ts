"use server";

import { redirect } from "next/navigation";

import { journalPosts } from "@/data/content";
import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { text } from "../promos/_kit/schema";
import { moveHomepageRow, toggleHomepageRow } from "./homepage-content.helpers";
import { LIST_PATH, revalidateHighlights } from "./homepage-highlights.helpers";

export async function deleteHomepageHighlightAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";
  if (!id) return;

  const existing = await prisma.homepageHighlight.findUnique({
    where: { id },
    select: { imageUrl: true },
  });
  if (!existing) redirect(LIST_PATH);

  await prisma.homepageHighlight.delete({ where: { id } });
  if (existing.imageUrl) {
    await deleteImageByUrl(existing.imageUrl).catch(() => {});
  }

  revalidateHighlights();
  redirect(`${LIST_PATH}?deleted=1`);
}

/** Pindahkan highlight satu langkah; seluruh urutan dinomori ulang 0..n. */
export async function moveHomepageHighlightAction(formData: FormData) {
  await moveHomepageRow(
    formData,
    LIST_PATH,
    () =>
      prisma.homepageHighlight.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true },
      }),
    (next) =>
      prisma.$transaction(
        next.map((rowId, index) =>
          prisma.homepageHighlight.update({ where: { id: rowId }, data: { sortOrder: index } }),
        ),
      ),
  );
}

/** Tampilkan/sembunyikan highlight langsung dari daftar. */
export async function toggleHomepageHighlightAction(formData: FormData) {
  await toggleHomepageRow(formData, LIST_PATH, (id, isPublished) =>
    prisma.homepageHighlight.update({ where: { id }, data: { isPublished } }),
  );
}

/**
 * Salin 3 kartu bawaan "What's New" menjadi highlight yang bisa diedit.
 * Hanya berjalan bila tabel masih kosong, sehingga tampilan homepage tetap
 * sama persis (judul, label, gambar, tautan, dan urutan identik).
 */
export async function importDefaultHighlightsAction() {
  await requireRole(CONTENT_ROLES);

  const count = await prisma.homepageHighlight.count();
  if (count > 0) redirect(LIST_PATH);

  await prisma.homepageHighlight.createMany({
    data: journalPosts.map((post, index) => ({
      eyebrow: post.tag,
      title: post.title,
      imageUrl: post.image,
      href: post.href,
      isPublished: true,
      sortOrder: index,
    })),
  });

  revalidateHighlights();
  redirect(`${LIST_PATH}?saved=1`);
}