/**
 * Query agregat tabel `PageView` untuk dashboard dan modul Pengunjung &
 * Halaman. Semua batas waktu dikirim sebagai epoch lalu dikonversi ke
 * timestamp UTC eksplisit, supaya hasilnya tidak bergantung pada timezone
 * sesi database.
 */

import { dbTable } from "@/lib/db-schema";
import { prisma } from "@/lib/prisma";
import {
  dayBuckets,
  dayKeyWib,
  totalViews,
  type DailyTrafficRow,
  type DayBucket,
} from "@/lib/domain/traffic";

export type TopPage = {
  path: string;
  views: number;
  uniqueVisitors: number;
};

export type TrafficOverview = {
  buckets: DayBucket[];
  daily: DailyTrafficRow[];
  uniqueVisitors: number;
  totalViews: number;
  distinctPaths: number;
  /** Pengunjung unik pada hari ini (WIB). */
  visitorsToday: number;
};

type TotalsRow = { visitors: number; paths: number };

/**
 * Ringkasan periode: seri harian, pengunjung unik seluruh periode, jumlah
 * tampilan, dan jumlah halaman berbeda. Pengunjung unik periode TIDAK sama
 * dengan jumlah pengunjung unik harian (orang yang sama dihitung sekali).
 */
export async function getTrafficOverview(
  now: Date,
  days: number,
): Promise<TrafficOverview> {
  const buckets = dayBuckets(now, days);
  const since = buckets[0]!.start.getTime() / 1000;
  const until = buckets.at(-1)!.end.getTime() / 1000;

  const [daily, totals] = await Promise.all([
    prisma.$queryRaw<DailyTrafficRow[]>`
      SELECT
        to_char(("createdAt" + INTERVAL '7 hours')::date, 'YYYY-MM-DD') AS "day",
        COUNT(*)::int AS "views",
        COUNT(DISTINCT "visitorId")::int AS "visitors"
      FROM ${dbTable("PageView")}
      WHERE "createdAt" >= (to_timestamp(${since}) AT TIME ZONE 'UTC')
        AND "createdAt" < (to_timestamp(${until}) AT TIME ZONE 'UTC')
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<TotalsRow[]>`
      SELECT
        COUNT(DISTINCT "visitorId")::int AS "visitors",
        COUNT(DISTINCT "path")::int AS "paths"
      FROM ${dbTable("PageView")}
      WHERE "createdAt" >= (to_timestamp(${since}) AT TIME ZONE 'UTC')
        AND "createdAt" < (to_timestamp(${until}) AT TIME ZONE 'UTC')
    `,
  ]);

  const today = dayKeyWib(now);
  return {
    buckets,
    daily,
    uniqueVisitors: totals[0]?.visitors ?? 0,
    totalViews: totalViews(daily),
    distinctPaths: totals[0]?.paths ?? 0,
    visitorsToday: daily.find((row) => row.day === today)?.visitors ?? 0,
  };
}

/** Halaman paling banyak diakses pada periode, terurut tampilan terbanyak. */
export async function getTopPages(
  now: Date,
  days: number,
  limit = 50,
): Promise<TopPage[]> {
  const buckets = dayBuckets(now, days);
  const since = buckets[0]!.start.getTime() / 1000;
  const until = buckets.at(-1)!.end.getTime() / 1000;
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
