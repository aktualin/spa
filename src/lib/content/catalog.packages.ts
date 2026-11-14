/** Bacaan package publik & slug katalog — lihat `catalog.ts`. */
import { cacheLife, cacheTag } from "next/cache";

import { safeQueryWithMeta } from "@/lib/safe-query";

import { getCatalog } from "./catalog.categories";
import { PACKAGE_INCLUDE, toCatalogPackage } from "./catalog.package-row";
import type { CatalogPackage } from "./catalog.types";
import { CONTENT_TAGS } from "./tags";

export async function getPackages(): Promise<CatalogPackage[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);

  const { data, usedFallback } = await safeQueryWithMeta(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.package.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: PACKAGE_INCLUDE,
    });
    return rows.map(toCatalogPackage);
  }, []);

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/** Satu package, di-cache per slug (alasannya sama dengan getCategory). */
export async function getPackage(slug: string): Promise<CatalogPackage | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);

  const { data, usedFallback } = await safeQueryWithMeta<CatalogPackage | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.package.findFirst({
        where: { slug, isPublished: true },
        include: PACKAGE_INCLUDE,
      });
      return row ? toCatalogPackage(row) : null;
    },
    null,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/**
 * Slug untuk `generateStaticParams`: kategori, treatment, dan package.
 * Ambil dari DB bila bisa; kalau tidak, dari data statis.
 */
export async function getCatalogSlugs(): Promise<{
  categories: string[];
  treatments: { categorySlug: string; treatmentSlug: string }[];
  packages: string[];
}> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);
  cacheLife("hours");

  const categories = await getCatalog();
  const packs = await getPackages();

  return {
    categories: categories.map((c) => c.slug),
    treatments: categories.flatMap((c) =>
      c.treatments.map((t) => ({
        categorySlug: c.slug,
        treatmentSlug: t.slug,
      })),
    ),
    packages: packs.map((p) => p.slug),
  };
}