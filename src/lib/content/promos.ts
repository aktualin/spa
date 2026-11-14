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

import { type PublicPromo, queryPromoRows, toPublicPromo } from "./promos.types";
import { CONTENT_TAGS } from "./tags";

export type { PublicPromo } from "./promos.types";

/** Semua promo yang sedang aktif (berlaku pada waktu sekarang). */
export async function getActivePromos(): Promise<PublicPromo[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.promos);

  const { data } = await safeQueryWithMeta<PublicPromo[]>(
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
        .map(toPublicPromo);
    },
    [],
  );

  cacheLife("minutes");
  return data;
}

/**
 * Detail satu promo. Mengembalikan `null` bila promo tidak ada ATAU tidak
 * lagi aktif — pemanggil memakai `notFound()`.
 */
export async function getActivePromo(slug: string): Promise<PublicPromo | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.promos);

  const { data } = await safeQueryWithMeta<PublicPromo | null>(
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
      return toPublicPromo(row);
    },
    null,
  );

  cacheLife("minutes");
  return data;
}