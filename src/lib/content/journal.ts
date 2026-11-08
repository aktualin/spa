/**
 * Bacaan publik Journal (modul 6).
 *
 * Hanya artikel yang terlihat publik (`isJournalVisible`): status PUBLISHED
 * atau SCHEDULED yang waktunya sudah lewat. Draf tidak pernah muncul.
 *
 * Penjadwalan tanpa cron/redeploy: visibilitas dihitung saat cache diisi, dan
 * umur cache dibuat pendek (`minutes`, revalidasi ±1 menit) sehingga artikel
 * terjadwal muncul sendiri tak lama setelah waktunya tiba.
 *
 * Belum ada artikel terbit, atau database tidak terbaca → daftar kosong.
 */
import { cacheLife, cacheTag } from "next/cache";

import {
  collectJournalCategories,
  collectJournalTags,
  filterJournalPosts,
  type JournalFilter,
} from "@/lib/domain/journal";
import { isJournalVisible, sortJournalByDate } from "@/lib/domain/visibility";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  bodyHtml: string | null;
  coverUrl: string | null;
  category: string | null;
  tags: string[];
  publishedAt: Date | null;
  updatedAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

type JournalRow = Omit<JournalPost, "bodyHtml"> & { bodyHtml: string };

function toJournalPost(row: JournalRow): JournalPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    bodyHtml: row.bodyHtml,
    coverUrl: row.coverUrl,
    category: row.category,
    tags: row.tags,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
  };
}

/**
 * Semua artikel yang terlihat publik, terbaru dulu. Satu entri cache untuk
 * semua filter — filter kategori/tag dijalankan di luar cache supaya isi
 * query string tidak bisa memperbanyak entri cache tanpa batas.
 */
async function getVisibleJournalPosts(): Promise<JournalPost[]> {
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
      const row = await prisma.journalPost.findUnique({ where: { slug } });
      if (!row || !isJournalVisible(row, new Date())) return null;
      return toJournalPost(row);
    },
    null,
  );

  return data;
}

/** Kategori yang dipakai artikel publik, untuk filter daftar. */
export async function getJournalCategories(): Promise<string[]> {
  return collectJournalCategories(await getVisibleJournalPosts());
}

/** Tag yang dipakai artikel publik (paling sering dulu), untuk filter daftar. */
export async function getJournalTags(): Promise<string[]> {
  return collectJournalTags(await getVisibleJournalPosts());
}
