/** Keranjang hari kalender WIB — lihat `traffic.ts`. */
import { DAY_MS, MONTH_LABELS, WIB_OFFSET_MS } from "./wib.ts";

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