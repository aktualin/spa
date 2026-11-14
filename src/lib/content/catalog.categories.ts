/** Bacaan kategori & treatment publik — lihat `catalog.ts`. */
import { cacheLife, cacheTag } from "next/cache";

import { safeQueryWithMeta } from "@/lib/safe-query";

import { CATEGORY_INCLUDE, toCatalogCategory } from "./catalog.category-row";
import type { CatalogCategory, CatalogTreatment } from "./catalog.types";
import { CONTENT_TAGS } from "./tags";

/** Kategori yang tampil beserta treatment published-nya. */
export async function getCatalog(): Promise<CatalogCategory[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);

  const { data, usedFallback } = await safeQueryWithMeta(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.treatmentCategory.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: CATEGORY_INCLUDE,
    });
    return rows.map(toCatalogCategory);
  }, []);

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/**
 * Satu kategori. Sengaja di-cache per slug dan membaca DB langsung — bukan
 * menyaring getCatalog(): halaman detail untuk slug yang belum ada saat build
 * dilanjutkan dari shell hasil build beserta cache-nya, sehingga data daftar
 * penuh di sana masih versi build dan kategori baru dari admin menjadi 404.
 */
export async function getCategory(slug: string): Promise<CatalogCategory | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);

  const { data, usedFallback } = await safeQueryWithMeta<CatalogCategory | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.treatmentCategory.findFirst({
        where: { slug, isPublished: true },
        include: CATEGORY_INCLUDE,
      });
      return row ? toCatalogCategory(row) : null;
    },
    null,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

export async function getTreatment(
  categorySlug: string,
  treatmentSlug: string,
): Promise<CatalogTreatment | null> {
  const category = await getCategory(categorySlug);
  return category?.treatments.find((t) => t.slug === treatmentSlug) ?? null;
}

/** Treatment ditandai `isBestSeller` — dipakai section Signature Treatments di homepage. */
export async function getSignatureTreatments(limit = 6): Promise<CatalogTreatment[]> {
  const all = (await getCatalog())
    .filter((c) => c.kind === "TREATMENT")
    .flatMap((c) => c.treatments);
  const flagged = all.filter((t) => t.isBestSeller);
  return (flagged.length > 0 ? flagged : all).slice(0, limit);
}

/** Semua treatment (published) dari seluruh kategori, beserta kategorinya. */
export async function getAllTreatments(): Promise<CatalogTreatment[]> {
  return (await getCatalog()).flatMap((c) => c.treatments);
}

/** Treatment dengan slug tertentu di kategori mana pun. */
export async function getTreatmentBySlug(
  slug: string,
): Promise<CatalogTreatment | null> {
  return (await getAllTreatments()).find((t) => t.slug === slug) ?? null;
}