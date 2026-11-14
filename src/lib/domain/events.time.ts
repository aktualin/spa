/** Helper waktu WIB untuk event — lihat `events.ts`. */
import { DAY_MS, WIB_OFFSET_MS } from "./wib.ts";

export const EVENT_TIME_ZONE = "Asia/Jakarta";

/** Pukul 23.59.59,999 WIB pada hari (WIB) yang sama dengan `date`. */
export function endOfWibDay(date: Date): Date {
  const wibMidnight = Math.floor((date.getTime() + WIB_OFFSET_MS) / DAY_MS) * DAY_MS;
  return new Date(wibMidnight - WIB_OFFSET_MS + DAY_MS - 1);
}

export const wibDayKey = (date: Date) =>
  Math.floor((date.getTime() + WIB_OFFSET_MS) / DAY_MS);