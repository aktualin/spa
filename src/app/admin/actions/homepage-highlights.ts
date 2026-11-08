"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { journalPosts } from "@/data/content";
import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { reorderIds, validateHighlightInput } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { checked, parseWibInput, text } from "../promos/_kit/schema";

/**
 * Server Action kartu highlight homepage (`HomepageHighlight`), ditampilkan
 * di section "What's New". Aturan isi ada di `@/lib/domain/homepage`.
 */

export type ActionState = { error: string | null; ok?: boolean };

const LIST_PATH = "/admin/homepage/highlights";

function revalidateHighlights() {
  updateTag(CONTENT_TAGS.homepage);
  revalidatePath(LIST_PATH);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

/** Semua highlight, urut seperti di homepage. */
export async function listHomepageHighlights() {
  await requireSession();

  return prisma.homepageHighlight.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getHomepageHighlight(id: string) {
  await requireSession();
  return prisma.homepageHighlight.findUnique({ where: { id } });
}

/** Buat atau ubah highlight (id kosong = baru, ditaruh paling bawah). */
export async function saveHomepageHighlightAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";

  // Awal periode = 00:00 WIB, akhir periode = 23:59:59.999 WIB.
  const startDate = parseWibInput(text(formData, "startDate"));
  const endDate = parseWibInput(text(formData, "endDate"), { endOfDay: true });
  if (startDate === undefined || endDate === undefined) {
    return { error: "Tanggal periode tidak valid." };
  }

  const result = validateHighlightInput({
    eyebrow: text(formData, "eyebrow"),
    title: text(formData, "title"),
    imageUrl: text(formData, "imageUrl"),
    imageAlt: text(formData, "imageAlt"),
    href: text(formData, "href"),
    ctaLabel: text(formData, "ctaLabel"),
    startDate,
    endDate,
    isPublished: checked(formData, "isPublished"),
  });
  if (!result.ok) return { error: result.error };
  const data = result.data;

  if (id) {
    const previous = await prisma.homepageHighlight.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!previous) return { error: "Highlight tidak ditemukan." };

    // `body` tidak ada di form (kartu What's New tidak menampilkan ringkasan),
    // jadi nilainya tidak ikut diubah.
    await prisma.homepageHighlight.update({ where: { id }, data });

    if (previous.imageUrl && previous.imageUrl !== data.imageUrl) {
      await deleteImageByUrl(previous.imageUrl).catch(() => {});
    }
  } else {
    const last = await prisma.homepageHighlight.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    await prisma.homepageHighlight.create({
      data: { ...data, sortOrder: last ? last.sortOrder + 1 : 0 },
    });
  }

  revalidateHighlights();
  redirect(`${LIST_PATH}?saved=1`);
}

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
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";
  const direction = text(formData, "direction") === "up" ? "up" : "down";
  if (!id) return;

  const rows = await prisma.homepageHighlight.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const next = reorderIds(
    rows.map((row) => row.id),
    id,
    direction,
  );
  if (!next) return;

  await prisma.$transaction(
    next.map((rowId, index) =>
      prisma.homepageHighlight.update({
        where: { id: rowId },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidateHighlights();
  redirect(`${LIST_PATH}?saved=1`);
}

/** Tampilkan/sembunyikan highlight langsung dari daftar. */
export async function toggleHomepageHighlightAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";
  const raw = text(formData, "isPublished");
  if (!id) return;

  await prisma.homepageHighlight.update({
    where: { id },
    data: { isPublished: raw === "1" },
  });

  revalidateHighlights();
  redirect(`${LIST_PATH}?saved=1`);
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
