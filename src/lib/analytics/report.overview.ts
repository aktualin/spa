/** Ringkasan periode trafik — lihat `report.ts`. */
import { dbTable } from "@/lib/db-schema";
import { prisma } from "@/lib/prisma";
import { dayKeyWib, totalViews, type DailyTrafficRow, type DayBucket } from "@/lib/domain/traffic";

import { periodRange } from "./report.range";

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
  const { buckets, since, until } = periodRange(now, days);

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