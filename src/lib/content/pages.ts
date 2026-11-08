/**
 * Bacaan publik halaman bebas (`StaticPage`, tampil di `/<slug>`).
 *
 * Hanya halaman berstatus PUBLISHED yang tampil. `bodyHtml` disimpan
 * ter-sanitasi; di halaman publik dirender ulang lewat `sanitizeHtml`.
 * DB kosong/down → tidak ada halaman (null / daftar kosong).
 */
import { cacheLife, cacheTag } from "next/cache";

import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type PublicPageTemplate = "STANDARD" | "LEGAL";

export type PublicPage = {
  id: string;
  slug: string;
  title: string;
  template: PublicPageTemplate;
  bodyHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
};

export type PublicPageSlug = {
  slug: string;
  updatedAt: Date;
};

/** Satu halaman terbit berdasarkan slug, atau `null` (pemanggil memakai `notFound()`). */
export async function getPublishedPage(slug: string): Promise<PublicPage | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.pages);

  const { data, usedFallback } = await safeQueryWithMeta<PublicPage | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.staticPage.findFirst({
        where: { slug, status: "PUBLISHED" },
        select: {
          id: true,
          slug: true,
          title: true,
          template: true,
          bodyHtml: true,
          seoTitle: true,
          seoDescription: true,
          publishedAt: true,
          updatedAt: true,
        },
      });
      if (!row) return null;
      return {
        ...row,
        seoTitle: row.seoTitle?.trim() || null,
        seoDescription: row.seoDescription?.trim() || null,
      };
    },
    null,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/** Slug semua halaman terbit, untuk sitemap. */
export async function getPublishedPageSlugs(): Promise<PublicPageSlug[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.pages);

  const { data, usedFallback } = await safeQueryWithMeta<PublicPageSlug[]>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      return prisma.staticPage.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
        orderBy: { slug: "asc" },
      });
    },
    [],
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
