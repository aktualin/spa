/** Kategori & tag untuk filter daftar Journal — lihat `journal.ts`. */
import { cacheLife, cacheTag } from "next/cache";

import {
  collectJournalCategories,
  collectJournalTags,
  orderJournalCategories,
} from "@/lib/domain/journal";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { getVisibleJournalPosts } from "./journal.queries";
import { CONTENT_TAGS } from "./tags";

/**
 * Kategori untuk filter daftar: urutannya mengikuti `sortOrder` yang diatur
 * admin, dan hanya kategori yang benar-benar punya artikel terlihat yang
 * ditampilkan supaya tidak ada chip filter yang hasilnya kosong.
 */
export async function getJournalCategories(): Promise<string[]> {
  const [ordered, posts] = await Promise.all([
    getJournalCategoryNames(),
    getVisibleJournalPosts(),
  ]);
  return orderJournalCategories(ordered, collectJournalCategories(posts));
}

/** Nama kategori terbit, urut `sortOrder` lalu nama. */
async function getJournalCategoryNames(): Promise<string[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.journal);
  cacheLife("hours");

  const { data } = await safeQueryWithMeta<string[]>(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.journalCategory.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true },
    });
    return rows.map((row) => row.name);
  }, []);

  return data;
}

/** Tag yang dipakai artikel publik (paling sering dulu), untuk filter daftar. */
export async function getJournalTags(): Promise<string[]> {
  return collectJournalTags(await getVisibleJournalPosts());
}