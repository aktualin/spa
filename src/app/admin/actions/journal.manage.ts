"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { collectJournalTags, journalPath } from "@/lib/domain/journal";
import { normalizePath } from "@/lib/domain/page-url";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { revalidateJournal } from "./journal.helpers";

export async function deletePostAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const post = await prisma.journalPost.findUnique({
    where: { id },
    select: { slug: true, coverUrl: true },
  });
  if (!post) redirect("/admin/journal?deleted=1");

  const path = journalPath(post.slug);

  // Redirect yang menuju artikel ini (mis. dari slug lamanya) ikut dihapus
  // agar tidak mengarah ke halaman 404.
  const removed = await prisma.$transaction(async (tx) => {
    const pointing = (
      await tx.redirect.findMany({ select: { fromPath: true, toPath: true } })
    ).filter((r) => r.toPath.startsWith("/") && normalizePath(r.toPath) === path);

    if (pointing.length > 0) {
      await tx.redirect.deleteMany({
        where: { fromPath: { in: pointing.map((r) => r.fromPath) } },
      });
    }
    await tx.journalPost.delete({ where: { id } });
    return pointing.length;
  });

  if (post.coverUrl) {
    await deleteImageByUrl(post.coverUrl).catch(() => {});
  }

  revalidateJournal([post.slug], removed > 0);
  redirect("/admin/journal?deleted=1");
}

export async function listPosts() {
  await requireSession();

  return prisma.journalPost.findMany({
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    include: { category: { select: { name: true } } },
  });
}

export async function getPost(id: string) {
  await requireSession();

  return prisma.journalPost.findUnique({
    where: { id },
    include: { category: { select: { name: true } } },
  });
}

/**
 * Pilihan kategori (urut sesuai admin) dan tag yang sudah dipakai, untuk form
 * artikel. Kategori yang belum terbit tetap ditawarkan — admin bisa menyiapkan
 * artikel sebelum kategorinya ditampilkan di situs.
 */
export async function listJournalTaxonomy(): Promise<{
  categories: { id: string; name: string; isPublished: boolean }[];
  tags: string[];
}> {
  await requireSession();

  const [categories, rows] = await Promise.all([
    prisma.journalCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, isPublished: true },
    }),
    prisma.journalPost.findMany({
      select: { tags: true },
      orderBy: [{ updatedAt: "desc" }],
    }),
  ]);

  return { categories, tags: collectJournalTags(rows) };
}