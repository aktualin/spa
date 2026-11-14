/** Grafik bulanan dashboard admin — lihat `admin-dashboard.ts`. */
import { MONTH_LABELS, WIB_OFFSET_MS } from "./wib.ts";

/** Satu bulan kalender WIB (UTC+7) yang dipakai sebagai keranjang grafik. */
export type MonthBucket = {
  key: string;
  label: string;
  /** Batas awal & akhir dalam UTC; `end` eksklusif. */
  start: Date;
  end: Date;
};

export type TrendPoint = {
  key: string;
  label: string;
  value: number;
};

/**
 * `count` bulan terakhir sampai bulan berjalan (WIB), urut dari terlama ke
 * terbaru. Dipakai untuk sumbu-x grafik dashboard.
 */
export function monthBuckets(now: Date, count = 6): MonthBucket[] {
  if (count <= 0) return [];
  const wibNow = new Date(now.getTime() + WIB_OFFSET_MS);
  const lastYear = wibNow.getUTCFullYear();
  const lastMonth = wibNow.getUTCMonth();
  const buckets: MonthBucket[] = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const rawMonth = lastMonth - offset;
    const year = lastYear + Math.floor(rawMonth / 12);
    const month = ((rawMonth % 12) + 12) % 12;
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;

    buckets.push({
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      label: MONTH_LABELS[month]!,
      start: new Date(Date.UTC(year, month, 1) - WIB_OFFSET_MS),
      end: new Date(Date.UTC(nextYear, nextMonth, 1) - WIB_OFFSET_MS),
    });
  }

  return buckets;
}

/** Menghitung jumlah `values` per keranjang bulan; nilai di luar rentang diabaikan. */
export function monthlyTrend(
  values: readonly Date[],
  buckets: readonly MonthBucket[],
): TrendPoint[] {
  const counts = buckets.map(() => 0);

  for (const value of values) {
    const time = value.getTime();
    for (let index = 0; index < buckets.length; index += 1) {
      const bucket = buckets[index]!;
      if (time >= bucket.start.getTime() && time < bucket.end.getTime()) {
        counts[index] += 1;
        break;
      }
    }
  }

  return buckets.map((bucket, index) => ({
    key: bucket.key,
    label: bucket.label,
    value: counts[index]!,
  }));
}