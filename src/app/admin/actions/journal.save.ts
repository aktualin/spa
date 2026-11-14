"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { journalPath } from "@/lib/domain/journal";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { isJournalVisible } from "@/lib/domain/visibility";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { SLUG_TAKEN, revalidateJournal, type ActionState } from "./journal.helpers";
import { persistJournalPost } from "./journal.persist";
import { validatePostForm } from "./journal.validate";

export async function savePostAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const result = validatePostForm(formData);
  if (!result.ok) return { error: result.error };
  const { id, data, tags, schedule, now } = result;

  const previous = id
    ? await prisma.journalPost.findUnique({
        where: { id },
        select: { slug: true, status: true, publishedAt: true, coverUrl: true },
      })
    : null;
  if (id && !previous) {
    return { error: "Artikel tidak ditemukan. Mungkin sudah dihapus." };
  }

  const clash = await prisma.journalPost.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return { error: SLUG_TAKEN(data.slug) };

  // Kategori yang dipilih harus benar-benar ada; id karangan ditolak.
  const categoryId = data.categoryId || null;
  if (categoryId) {
    const exists = await prisma.journalCategory.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!exists) return { error: "Kategori tidak ditemukan. Muat ulang halaman lalu pilih lagi." };
  }

  const payload = {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    bodyHtml: data.bodyHtml,
    coverUrl: data.coverUrl,
    categoryId,
    tags,
    status: schedule.status,
    publishedAt: schedule.publishedAt,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
  };

  const newPath = journalPath(data.slug);
  // Alamat lama tetap hidup (301) bila slug artikel yang sudah tampil publik berubah.
  const needsSlugRedirect =
    previous !== null && previous.slug !== data.slug && isJournalVisible(previous, now);

  let redirectsChanged = false;
  try {
    redirectsChanged = await persistJournalPost({
      id,
      payload,
      previous,
      needsSlugRedirect,
      title: data.title,
      newPath,
      publishing: schedule.status !== "DRAFT",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: SLUG_TAKEN(data.slug) };
    }
    throw error;
  }

  // Sampul lama dibuang setelah simpan berhasil (berkas Media Library tidak ikut terhapus).
  if (previous?.coverUrl && previous.coverUrl !== data.coverUrl) {
    await deleteImageByUrl(previous.coverUrl).catch(() => {});
  }

  revalidateJournal([previous?.slug, data.slug], redirectsChanged);
  redirect("/admin/journal?saved=1");
}