/** Rentang waktu query agregat trafik — lihat `report.ts`. */
import { dayBuckets, type DayBucket } from "@/lib/domain/traffic";

/**
 * Keranjang hari + batas epoch (detik) untuk query SQL. Semua batas waktu
 * dikirim sebagai epoch lalu dikonversi ke timestamp UTC eksplisit, supaya
 * hasilnya tidak bergantung pada timezone sesi database.
 */
export function periodRange(
  now: Date,
  days: number,
): { buckets: DayBucket[]; since: number; until: number } {
  const buckets = dayBuckets(now, days);
  return {
    buckets,
    since: buckets[0]!.start.getTime() / 1000,
    until: buckets.at(-1)!.end.getTime() / 1000,
  };
}