/**
 * Bacaan SEO publik: override per halaman (`PageSeo`), pengaturan SEO global
 * (3 kolom `SiteSettings`: favicon, OG bawaan, verifikasi GSC), dan stempel
 * waktu untuk sitemap.
 *
 * Semua fungsi memakai `"use cache"` sehingga aman dipanggil dari
 * `generateMetadata` (termasuk root layout) tanpa membuat halaman dinamis.
 * DB kosong/down → nilai kosong, sehingga metadata bawaan yang dipakai.
 */
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { latestDate as latest, mergePageSeo, normalizeSeoPath } from "@/lib/domain/seo";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type PageSeoOverride = {
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
};

export type SeoSettings = {
  gscVerification: string | null;
  faviconUrl: string | null;
  defaultOgImageUrl: string | null;
};

const EMPTY_SETTINGS: SeoSettings = {
  gscVerification: null,
  faviconUrl: null,
  defaultOgImageUrl: null,
};

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

/** Favicon, gambar OG bawaan, dan kode verifikasi Google Search Console. */
export async function getSeoSettings(): Promise<SeoSettings> {
  "use cache";
  cacheTag(CONTENT_TAGS.seo);
  cacheTag(CONTENT_TAGS.settings);

  const { data, usedFallback } = await safeQueryWithMeta<SeoSettings>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.siteSettings.findUnique({
        where: { id: "singleton" },
        select: { gscVerification: true, faviconUrl: true, defaultOgImageUrl: true },
      });
      if (!row) return EMPTY_SETTINGS;
      return {
        gscVerification: row.gscVerification?.trim() || null,
        faviconUrl: row.faviconUrl?.trim() || null,
        defaultOgImageUrl: row.defaultOgImageUrl?.trim() || null,
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

/* ---------- Stempel waktu sitemap ---------- */

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

function bySlug(rows: { slug: string; updatedAt: Date }[]): Record<string, Date> {
  return Object.fromEntries(rows.map((row) => [row.slug, row.updatedAt]));
}

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
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const slugAndDate = { select: { slug: true, updatedAt: true } } as const;
      const maxUpdated = { _max: { updatedAt: true } } as const;

      const [
        categories,
        treatments,
        packages,
        events,
        promos,
        journal,
        homepage,
        highlights,
        ourStory,
        membershipProgram,
        membershipTiers,
        corporate,
        corporatePrograms,
        gallery,
        retail,
        giftCard,
        settings,
      ] = await Promise.all([
        prisma.treatmentCategory.findMany(slugAndDate),
        prisma.treatment.findMany(slugAndDate),
        prisma.package.findMany(slugAndDate),
        prisma.eventItem.findMany(slugAndDate),
        prisma.promo.findMany(slugAndDate),
        prisma.journalPost.aggregate({ ...maxUpdated, where: { status: "PUBLISHED" } }),
        prisma.homepageSection.aggregate(maxUpdated),
        prisma.homepageHighlight.aggregate(maxUpdated),
        prisma.ourStoryContent.aggregate(maxUpdated),
        prisma.membershipProgram.aggregate(maxUpdated),
        prisma.membershipTier.aggregate(maxUpdated),
        prisma.corporateContent.aggregate(maxUpdated),
        prisma.corporateProgram.aggregate(maxUpdated),
        prisma.galleryAlbum.aggregate(maxUpdated),
        prisma.retailProduct.aggregate(maxUpdated),
        prisma.giftCardInfo.aggregate(maxUpdated),
        prisma.siteSettings.aggregate(maxUpdated),
      ]);

      const catalogDates = [...categories, ...treatments, ...packages].map(
        (row) => row.updatedAt,
      );

      return {
        sections: {
          home: latest(homepage._max.updatedAt, highlights._max.updatedAt),
          catalog: latest(...catalogDates),
          promos: latest(...promos.map((row) => row.updatedAt)),
          membership: latest(
            membershipProgram._max.updatedAt,
            membershipTiers._max.updatedAt,
          ),
          corporate: latest(corporate._max.updatedAt, corporatePrograms._max.updatedAt),
          story: latest(ourStory._max.updatedAt),
          journal: latest(journal._max.updatedAt),
          gallery: latest(gallery._max.updatedAt),
          events: latest(...events.map((row) => row.updatedAt)),
          retail: latest(retail._max.updatedAt),
          giftCard: latest(giftCard._max.updatedAt),
          contact: latest(settings._max.updatedAt),
        },
        categories: bySlug(categories),
        treatments: bySlug(treatments),
        packages: bySlug(packages),
        events: bySlug(events),
        promos: bySlug(promos),
      };
    },
    EMPTY_TIMESTAMPS,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
