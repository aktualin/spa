/** Stempel waktu sitemap (cache) — lihat `seo.ts`. */
import { cacheLife, cacheTag } from "next/cache";

import { safeQueryWithMeta } from "@/lib/safe-query";

import { readSitemapTimestamps } from "./seo.sitemap-read";
import { CONTENT_TAGS } from "./tags";

export type SitemapTimestamps = {
  /** Kunci = `SitemapStampKey` halaman tetap. */
  sections: Partial<Record<string, Date>>;
  categories: Record<string, Date>;
  treatments: Record<string, Date>;
  packages: Record<string, Date>;
  events: Record<string, Date>;
  promos: Record<string, Date>;
};

const EMPTY_TIMESTAMPS: SitemapTimestamps = {
  sections: {},
  categories: {},
  treatments: {},
  packages: {},
  events: {},
  promos: {},
};

/**
 * `updatedAt` konten untuk `lastModified` sitemap. Visibilitas (terbit/aktif)
 * TIDAK ditentukan di sini — sitemap tetap memakai daftar slug dari bacaan
 * publik masing-masing modul, lalu hanya mencari tanggalnya di peta ini.
 */
export async function getSitemapTimestamps(): Promise<SitemapTimestamps> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);
  cacheTag(CONTENT_TAGS.events);
  cacheTag(CONTENT_TAGS.promos);
  cacheTag(CONTENT_TAGS.journal);
  cacheTag(CONTENT_TAGS.homepage);
  cacheTag(CONTENT_TAGS.ourStory);
  cacheTag(CONTENT_TAGS.membership);
  cacheTag(CONTENT_TAGS.corporate);
  cacheTag(CONTENT_TAGS.gallery);
  cacheTag(CONTENT_TAGS.retail);
  cacheTag(CONTENT_TAGS.giftCard);
  cacheTag(CONTENT_TAGS.settings);

  const { data, usedFallback } = await safeQueryWithMeta<SitemapTimestamps>(
    readSitemapTimestamps,
    EMPTY_TIMESTAMPS,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}