/**
 * Bacaan publik promo (`Promo`).
 *
 * Hanya promo AKTIF yang tampil: published, sudah mulai, belum berakhir.
 * Filter waktu memakai `isPromoActive` dari `@/lib/domain/visibility` dan
 * dijalankan DI DALAM fungsi cached (agar `new Date()` aman saat prerender).
 */
import { cacheLife, cacheTag } from "next/cache";

import { isPromoActive } from "@/lib/domain/visibility";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type PublicPromo = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  bannerUrl: string | null;
  terms: string | null;
  startDate: Date | null;
  endDate: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  whatsappMessage: string | null;
};

type PromoRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  bannerUrl: string | null;
  terms: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  whatsappMessage: string | null;
};

async function queryPromoRows(): Promise<PromoRow[]> {
  const { prisma } = await import("@/lib/prisma");
  return prisma.promo.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { startDate: "asc" }],
  });
}

/** Semua promo yang sedang aktif (berlaku pada waktu sekarang). */
export async function getActivePromos(): Promise<PublicPromo[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.promos);

  const { data, usedFallback } = await safeQueryWithMeta<PublicPromo[]>(
    async () => {
      const now = new Date();
      const rows = await queryPromoRows();
      return rows
        .filter((row) =>
          isPromoActive(
            {
              isPublished: row.isPublished,
              startDate: row.startDate,
              endDate: row.endDate,
            },
            now,
          ),
        )
        .map((row) => ({
          id: row.id,
          slug: row.slug,
          title: row.title,
          description: row.description,
          bannerUrl: row.bannerUrl,
          terms: row.terms,
          startDate: row.startDate,
          endDate: row.endDate,
          seoTitle: row.seoTitle,
          seoDescription: row.seoDescription,
          whatsappMessage: row.whatsappMessage,
        }));
    },
    [],
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("minutes");
  return data;
}

/**
 * Detail satu promo. Mengembalikan `null` bila promo tidak ada ATAU tidak
 * lagi aktif — pemanggil memakai `notFound()`.
 */
export async function getActivePromo(slug: string): Promise<PublicPromo | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.promos);

  const { data, usedFallback } = await safeQueryWithMeta<PublicPromo | null>(
    async () => {
      const now = new Date();
      const rows = await queryPromoRows();
      const row = rows.find((r) => r.slug === slug);
      if (!row) return null;
      if (
        !isPromoActive(
          {
            isPublished: row.isPublished,
            startDate: row.startDate,
            endDate: row.endDate,
          },
          now,
        )
      ) {
        return null;
      }
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        bannerUrl: row.bannerUrl,
        terms: row.terms,
        startDate: row.startDate,
        endDate: row.endDate,
        seoTitle: row.seoTitle,
        seoDescription: row.seoDescription,
        whatsappMessage: row.whatsappMessage,
      };
    },
    null,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("minutes");
  return data;
}
