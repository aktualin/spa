/** Periode analitik pengunjung — lihat `traffic.ts`. */

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