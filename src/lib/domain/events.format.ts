/** Format tanggal event (WIB) — lihat `events.ts`. */
import { EVENT_TIME_ZONE, wibDayKey } from "./events.time.ts";

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: EVENT_TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * "12 December 2026", atau "12 December 2026 — 14 December 2026".
 * Selalu dalam WIB, terlepas dari zona waktu server.
 */
export function formatEventDateRange(start: Date | null, end: Date | null): string {
  if (!start) return "Date to be announced";
  const first = dayFormatter.format(start);
  if (!end || wibDayKey(end) === wibDayKey(start)) return first;
  return `${first} — ${dayFormatter.format(end)}`;
}
