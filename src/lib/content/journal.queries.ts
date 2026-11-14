/** Bacaan artikel publik Journal — lihat `journal.ts`. */
import { cacheLife, cacheTag } from "next/cache";

import { filterJournalPosts, type JournalFilter } from "@/lib/domain/journal";
import { isJournalVisible, sortJournalByDate } from "@/lib/domain/visibility";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { type JournalPost, toJournalPost } from "./journal.types";
import { CONTENT_TAGS } from "./tags";

/**
 * Semua artikel yang terlihat publik, terbaru dulu. Satu entri cache untuk
 * semua filter — filter kategori/tag dijalankan di luar cache supaya isi
 * query string tidak bisa memperbanyak entri cache tanpa batas.
 */
export async function getVisibleJournalPosts(): Promise<JournalPost[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.journal);
  // Bergantung waktu (artikel terjadwal), jadi cache pendek.
  cacheLife("minutes");

  const { data } = await safeQueryWithMeta(async () => {
    const { prisma } = await import("@/lib/prisma");
    const now = new Date();
    const rows = await prisma.journalPost.findMany({
      where: {
        status: { in: ["PUBLISHED", "SCHEDULED"] },
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: { category: { select: { name: true } } },
    });
    const visible = rows.filter((row) => isJournalVisible(row, now));
    return sortJournalByDate(visible).map(toJournalPost);
  }, []);

  return data;
}

/**
 * Daftar artikel publik, opsional disaring per kategori (string, demi
 * kompatibilitas pemanggil lama) atau `{ category, tag }`.
 */
export async function getJournalPosts(
  filter?: string | JournalFilter,
): Promise<JournalPost[]> {
  const posts = await getVisibleJournalPosts();
  const normalized: JournalFilter =
    typeof filter === "string" ? { category: filter } : (filter ?? {});
  return filterJournalPosts(posts, normalized);
}

/**
 * Satu artikel, di-cache per slug dan membaca DB langsung — bukan menyaring
 * getJournalPosts(): halaman artikel yang belum ada saat build dilanjutkan
 * dari shell hasil build beserta cache-nya, sehingga artikel baru jadi 404.
 */
export async function getJournalPost(slug: string): Promise<JournalPost | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.journal);
  // Bergantung waktu (artikel terjadwal), jadi cache pendek.
  cacheLife("minutes");

  const { data } = await safeQueryWithMeta<JournalPost | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.journalPost.findUnique({
        where: { slug },
        include: { category: { select: { name: true } } },
      });
      if (!row || !isJournalVisible(row, new Date())) return null;
      return toJournalPost(row);
    },
    null,
  );

  return data;
}