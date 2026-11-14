/** Bacaan override & pengaturan SEO publik — lihat `seo.ts`. */
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { mergePageSeo, normalizeSeoPath } from "@/lib/domain/seo";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { EMPTY_SETTINGS, type PageSeoOverride, type SeoSettings } from "./seo.types";
import { CONTENT_TAGS } from "./tags";

export async function getPageSeo(path: string): Promise<PageSeoOverride | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.seo);

  const { data } = await safeQueryWithMeta<PageSeoOverride | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.pageSeo.findUnique({
        where: { path: normalizeSeoPath(path) },
        select: { title: true, description: true, ogImageUrl: true },
      });
      if (!row) return null;
      return {
        title: row.title?.trim() || null,
        description: row.description?.trim() || null,
        ogImageUrl: row.ogImageUrl?.trim() || null,
      };
    },
    null,
  );

  // Umur cache tetap panjang: `PageSeo` jarang berubah, dan admin memanggil
  // `updateTag` setiap menyimpan.
  cacheLife("hours");
  return data;
}

/**
 * Favicon, gambar OG bawaan, kode verifikasi Google Search Console, dan
 * teks SEO global (site name, judul/deskripsi bawaan, OG, template judul,
 * keywords) dari Kontak & Umum.
 */
export async function getSeoSettings(): Promise<SeoSettings> {
  "use cache";
  cacheTag(CONTENT_TAGS.seo);
  cacheTag(CONTENT_TAGS.settings);

  const { data, usedFallback } = await safeQueryWithMeta<SeoSettings>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.siteSettings.findUnique({
        where: { id: "singleton" },
        select: {
          gscVerification: true,
          faviconUrl: true,
          defaultOgImageUrl: true,
          seoSiteName: true,
          seoDefaultTitle: true,
          seoDefaultDescription: true,
          seoOgDescription: true,
          seoOgLocale: true,
          seoTitleTemplate: true,
          seoKeywords: true,
        },
      });
      if (!row) return EMPTY_SETTINGS;
      return {
        gscVerification: row.gscVerification?.trim() || null,
        faviconUrl: row.faviconUrl?.trim() || null,
        defaultOgImageUrl: row.defaultOgImageUrl?.trim() || null,
        seoSiteName: row.seoSiteName?.trim() || null,
        seoDefaultTitle: row.seoDefaultTitle?.trim() || null,
        seoDefaultDescription: row.seoDefaultDescription?.trim() || null,
        seoOgDescription: row.seoOgDescription?.trim() || null,
        seoOgLocale: row.seoOgLocale?.trim() || null,
        seoTitleTemplate: row.seoTitleTemplate?.trim() || null,
        seoKeywords: row.seoKeywords ?? [],
      };
    },
    EMPTY_SETTINGS,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/**
 * Menggabungkan metadata default halaman dengan override `PageSeo` dan
 * pengaturan global, lalu melengkapi canonical, Open Graph, dan twitter card.
 * Lihat `mergePageSeo` di `@/lib/domain/seo`.
 */
export async function withPageSeo(
  path: string,
  defaults: Metadata,
): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getPageSeo(path), getSeoSettings()]);
  return mergePageSeo(path, defaults, seo, settings);
}