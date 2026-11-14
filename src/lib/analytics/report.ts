/**
 * Query agregat tabel `PageView` untuk dashboard dan modul Pengunjung &
 * Halaman. Semua batas waktu dikirim sebagai epoch lalu dikonversi ke
 * timestamp UTC eksplisit, supaya hasilnya tidak bergantung pada timezone
 * sesi database.
 */

import { dbTable } from "@/lib/db-schema";
import { prisma } from "@/lib/prisma";

import { periodRange } from "./report.range";

export type { TrafficOverview } from "./report.overview";
export { getTrafficOverview } from "./report.overview";

export type TopPage = {
  path: string;
  views: number;
  uniqueVisitors: number;
};

/** Halaman paling banyak diakses pada periode, terurut tampilan terbanyak. */
export async function getTopPages(
  now: Date,
  days: number,
  limit = 50,
): Promise<TopPage[]> {
  const { since, until } = periodRange(now, days);
  const safeLimit = Math.min(200, Math.max(1, Math.trunc(limit)));

  return prisma.$queryRaw<TopPage[]>`
    SELECT
      "path",
      COUNT(*)::int AS "views",
      COUNT(DISTINCT "visitorId")::int AS "uniqueVisitors"
    FROM ${dbTable("PageView")}
    WHERE "createdAt" >= (to_timestamp(${since}) AT TIME ZONE 'UTC')
      AND "createdAt" < (to_timestamp(${until}) AT TIME ZONE 'UTC')
    GROUP BY "path"
    ORDER BY "views" DESC, "path" ASC
    LIMIT ${safeLimit}
  `;
}