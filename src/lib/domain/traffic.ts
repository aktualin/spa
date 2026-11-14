/**
 * Analitik pengunjung halaman — logika murni (tanpa Prisma/Next.js) supaya
 * bisa diuji unit. Sumber datanya tabel `PageView` yang diisi src/proxy.ts.
 *
 * Semua keranjang hari memakai kalender WIB (UTC+7 tetap, tanpa DST) supaya
 * angka "hari ini" sama dengan tanggal yang dilihat admin di Jakarta.
 * Implementasinya dipecah ke `traffic.period.ts` dan `traffic.buckets.ts`;
 * berkas ini mengekspor ulangnya plus agregat grafiknya.
 */

import type { TrendPoint } from "./admin-dashboard.ts";
import type { DayBucket } from "./traffic.buckets.ts";

export {
  TRAFFIC_PERIOD_DAYS,
  type TrafficPeriodDays,
  DEFAULT_TRAFFIC_PERIOD_DAYS,
  parseTrafficPeriod,
} from "./traffic.period.ts";
export { type DayBucket, dayKeyWib, dayBuckets } from "./traffic.buckets.ts";

/** Satu baris agregat harian dari database. */
export type DailyTrafficRow = {
  /** Tanggal WIB "YYYY-MM-DD". */
  day: string;
  views: number;
  visitors: number;
};

/**
 * Mengubah agregat harian menjadi titik grafik; hari tanpa data tetap muncul
 * dengan nilai 0 supaya garis waktu tidak bolong.
 */
export function dailyTrafficSeries(
  rows: readonly DailyTrafficRow[],
  buckets: readonly DayBucket[],
  metric: "visitors" | "views",
): TrendPoint[] {
  const byDay = new Map(rows.map((row) => [row.day, row]));
  return buckets.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    value: byDay.get(bucket.key)?.[metric] ?? 0,
  }));
}

/** Total tampilan halaman dari agregat harian. */
export function totalViews(rows: readonly DailyTrafficRow[]): number {
  return rows.reduce((sum, row) => sum + row.views, 0);
}

/** Rata-rata halaman dibuka per pengunjung unik; 0 bila belum ada pengunjung. */
export function averagePagesPerVisitor(
  views: number,
  uniqueVisitors: number,
): number {
  if (uniqueVisitors <= 0) return 0;
  return views / uniqueVisitors;
}

/** Porsi tampilan satu halaman terhadap total; 0 bila total kosong. */
export function pageViewShare(views: number, viewsTotal: number): number {
  if (viewsTotal <= 0) return 0;
  return views / viewsTotal;
}