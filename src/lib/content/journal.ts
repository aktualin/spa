/**
 * Bacaan publik Journal (modul 6).
 *
 * Hanya artikel yang terlihat publik (`isJournalVisible`): status PUBLISHED
 * atau SCHEDULED yang waktunya sudah lewat. Post DRAFT/ARCHIVED tidak pernah
 * muncul./posts tanpa `bodyHtml` (fallback statis) ditampilkan lewat excerpt.
 */
import { cacheLife, cacheTag } from "next/cache";

import { journalPosts as staticJournalPosts } from "@/data/content";
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
  seoTitle: string | null;
  seoDescription: string | null;
};

/** Fallback statis: tiga artikel dari `src/data/content.ts` (tanpa body). */
function staticJournalPostsList(): JournalPost[] {
  return staticJournalPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? null,
    bodyHtml: null,
    coverUrl: p.image,
    category: p.tag ?? null,
    tags: p.tag ? [p.tag] : [],
    publishedAt: null,
    seoTitle: null,
    seoDescription: null,
  }));
}

/**
 * Daftar artikel yang terlihat publik, terbaru dulu.
 * Filter waktu dijalankan di dalam fungsi cached; karena bergantung pada
 * waktu, cache-nya berumur pendek (`minutes`).
 */
export async function getJournalPosts(category?: string): Promise<JournalPost[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.journal);

  const { data, usedFallback } = await safeQueryWithMeta(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.journalPost.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ publishedAt: "desc" }],
    });
    const visible = rows.filter((row) => isJournalVisible(row, new Date()));
    if (visible.length === 0) throw new Error("belum ada artikel journal");
    return sortJournalByDate(visible).map<JournalPost>((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      bodyHtml: p.bodyHtml,
      coverUrl: p.coverUrl,
      category: p.category,
      tags: p.tags,
      publishedAt: p.publishedAt,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    }));
  }, staticJournalPostsList());

  // Filter waktu → cache pendek supaya post terjadwal otomatis muncul.
  if (usedFallback) cacheLife("minutes");
  else cacheLife("minutes");

  const posts = category
    ? data.filter((p) => (p.category ?? "") === category)
    : data;
  return sortJournalByDate(posts);
}

/** Satu artikel (hanya yang terlihat publik). */
/**
 * Satu artikel, di-cache per slug dan membaca DB langsung — bukan menyaring
 * getJournalPosts(): halaman artikel yang belum ada saat build dilanjutkan
 * dari shell hasil build beserta cache-nya, sehingga artikel baru jadi 404.
 */
export async function getJournalPost(slug: string): Promise<JournalPost | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.journal);

  const { data } = await safeQueryWithMeta<JournalPost | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.journalPost.findUnique({ where: { slug } });
      if (!row || !isJournalVisible(row, new Date())) return null;
      return {
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        bodyHtml: row.bodyHtml,
        coverUrl: row.coverUrl,
        category: row.category,
        tags: row.tags,
        publishedAt: row.publishedAt,
        seoTitle: row.seoTitle,
        seoDescription: row.seoDescription,
      };
    },
    staticJournalPostsList().find((p) => p.slug === slug) ?? null,
  );

  // Bergantung waktu (artikel terjadwal), jadi cache pendek.
  cacheLife("minutes");
  return data;
}

/** Daftar kategori yang dipakai untuk filter. */
export async function getJournalCategories(): Promise<string[]> {
  const posts = await getJournalPosts();
  const categories = posts
    .map((p) => p.category)
    .filter((c): c is string => !!c);
  return [...new Set(categories)];
}
