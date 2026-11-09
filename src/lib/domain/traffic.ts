/**
 * Analitik pengunjung halaman — logika murni (tanpa Prisma/Next.js) supaya
 * bisa diuji unit. Sumber datanya tabel `PageView` yang diisi src/proxy.ts.
 *
 * Semua keranjang hari memakai kalender WIB (UTC+7 tetap, tanpa DST) supaya
 * angka "hari ini" sama dengan tanggal yang dilihat admin di Jakarta.
 */

import type { TrendPoint } from "./admin-dashboard.ts";

const DAY_MS = 24 * 60 * 60 * 1000;
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

/** Periode yang boleh dipilih di halaman Pengunjung & Halaman. */
export const TRAFFIC_PERIOD_DAYS = [7, 30, 90] as const;
export type TrafficPeriodDays = (typeof TRAFFIC_PERIOD_DAYS)[number];
export const DEFAULT_TRAFFIC_PERIOD_DAYS: TrafficPeriodDays = 30;

/** "30" → 30; nilai asing/negatif → default 30 hari. */
export function parseTrafficPeriod(
  value: string | undefined,
): TrafficPeriodDays {
  const days = Number.parseInt(value ?? "", 10);
  return (TRAFFIC_PERIOD_DAYS as readonly number[]).includes(days)
    ? (days as TrafficPeriodDays)
    : DEFAULT_TRAFFIC_PERIOD_DAYS;
}

/** Satu hari kalender WIB; `end` eksklusif. */
export type DayBucket = {
  key: string;
  label: string;
  start: Date;
  end: Date;
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Tanggal WIB dalam bentuk "YYYY-MM-DD" — kunci yang dipakai query SQL. */
export function dayKeyWib(date: Date): string {
  const shifted = new Date(date.getTime() + WIB_OFFSET_MS);
  return `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}-${pad2(
    shifted.getUTCDate(),
  )}`;
}

/**
 * `days` keranjang hari terakhir termasuk hari ini, urut lama → baru.
 * Batas hari dihitung dari tengah malam WIB lalu dikembalikan ke UTC.
 */
export function dayBuckets(now: Date, days: number): DayBucket[] {
  const count = Math.min(365, Math.max(1, Math.trunc(days)));
  const shifted = new Date(now.getTime() + WIB_OFFSET_MS);
  const todayStartUtc =
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
    ) - WIB_OFFSET_MS;

  const buckets: DayBucket[] = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const start = new Date(todayStartUtc - index * DAY_MS);
    const end = new Date(start.getTime() + DAY_MS);
    const wib = new Date(start.getTime() + WIB_OFFSET_MS);
    buckets.push({
      key: `${wib.getUTCFullYear()}-${pad2(wib.getUTCMonth() + 1)}-${pad2(
        wib.getUTCDate(),
      )}`,
      label: `${wib.getUTCDate()} ${MONTH_LABELS[wib.getUTCMonth()]}`,
      start,
      end,
    });
  }
  return buckets;
}

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
