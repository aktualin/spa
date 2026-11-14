/** Format tanggal event (WIB) — lihat `events.ts`. */
import { EVENT_TIME_ZONE, wibDayKey } from "./events.time.ts";

const dayFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: EVENT_TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * "12 Desember 2026", atau "12 Desember 2026 — 14 Desember 2026".
 * Selalu dalam WIB, terlepas dari zona waktu server.
 */
export function formatEventDateRange(start: Date | null, end: Date | null): string {
  if (!start) return "Tanggal menyusul";
  const first = dayFormatter.format(start);
  if (!end || wibDayKey(end) === wibDayKey(start)) return first;
  return `${first} — ${dayFormatter.format(end)}`;
}