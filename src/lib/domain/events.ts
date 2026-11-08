/**
 * Aturan modul Events: status event berdasarkan tanggal, pengelompokan untuk
 * halaman publik, validasi tanggal/slug/tautan mitra, dan format tanggal.
 *
 * Modul murni (tanpa I/O) supaya bisa diuji langsung dengan `node --test`.
 *
 * ATURAN STATUS (dievaluasi terhadap waktu sekarang, zona WIB):
 * - Mulai event  = `startDate` (input tanggal → pukul 00.00 WIB).
 * - Akhir event  = `endDate` (→ pukul 23.59 WIB); bila kosong, akhir hari
 *   tanggal mulai (event satu hari).
 * - "Akan datang"        : sekarang < mulai.
 * - "Sedang berlangsung" : mulai ≤ sekarang ≤ akhir.
 * - "Sudah lewat"        : sekarang > akhir.
 * - "Tanggal menyusul"   : tanpa tanggal sama sekali. Event biasa dianggap
 *   masih akan datang; event kolaborasi dianggap arsip (sudah lewat).
 *
 * PENGELOMPOKAN HALAMAN PUBLIK:
 * - Upcoming (/events)                 : semua event yang belum lewat
 *   (akan datang, sedang berlangsung, tanggal menyusul) — termasuk kolaborasi.
 * - Past (/events, "Telah berlalu")    : event biasa yang sudah lewat.
 * - Past collaborations
 *   (/events/collaborations)           : event kolaborasi yang sudah lewat.
 */

import { SLUG_PATTERN } from "./slug.ts";

export const EVENT_TIME_ZONE = "Asia/Jakarta";
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type EventPhase = "upcoming" | "ongoing" | "past" | "tba";

export type EventLike = {
  startDate?: Date | null;
  endDate?: Date | null;
  isCollaboration?: boolean;
  sortOrder?: number | null;
};

export const EVENT_PHASE_LABEL: Record<EventPhase, string> = {
  upcoming: "Akan datang",
  ongoing: "Sedang berlangsung",
  past: "Sudah lewat",
  tba: "Tanggal menyusul",
};

/** Pukul 23.59.59,999 WIB pada hari (WIB) yang sama dengan `date`. */
export function endOfWibDay(date: Date): Date {
  const wibMidnight = Math.floor((date.getTime() + WIB_OFFSET_MS) / DAY_MS) * DAY_MS;
  return new Date(wibMidnight - WIB_OFFSET_MS + DAY_MS - 1);
}

/** Saat event dianggap selesai; null bila event belum punya tanggal. */
export function eventEndsAt(event: EventLike): Date | null {
  if (event.endDate) return event.endDate;
  if (event.startDate) return endOfWibDay(event.startDate);
  return null;
}

/** Status event pada waktu `now` (lihat aturan di atas). */
export function eventPhase(event: EventLike, now: Date = new Date()): EventPhase {
  const end = eventEndsAt(event);
  if (!end) return event.isCollaboration ? "past" : "tba";
  if (end.getTime() < now.getTime()) return "past";
  if (event.startDate && event.startDate.getTime() > now.getTime()) return "upcoming";
  return "ongoing";
}

/** Event belum lewat (akan datang, sedang berlangsung, atau tanggal menyusul). */
export function isEventUpcoming(event: EventLike, now: Date = new Date()): boolean {
  return eventPhase(event, now) !== "past";
}

export function isEventPast(event: EventLike, now: Date = new Date()): boolean {
  return eventPhase(event, now) === "past";
}

const bySortOrder = (a: EventLike, b: EventLike) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0);

/**
 * Membagi event menjadi upcoming, past, dan past collaborations.
 * Urutan: "Urutan tampil" (kecil di atas), lalu tanggal — upcoming tanggal
 * terdekat lebih dulu (tanggal menyusul paling akhir), past & kolaborasi
 * terbaru lebih dulu.
 */
export function groupEvents<T extends EventLike>(
  events: readonly T[],
  now: Date = new Date(),
): { upcoming: T[]; past: T[]; collaborations: T[] } {
  const upcoming: T[] = [];
  const past: T[] = [];
  const collaborations: T[] = [];

  for (const event of events) {
    if (!isEventPast(event, now)) upcoming.push(event);
    else if (event.isCollaboration) collaborations.push(event);
    else past.push(event);
  }

  upcoming.sort(
    (a, b) =>
      bySortOrder(a, b) ||
      (a.startDate?.getTime() ?? Infinity) - (b.startDate?.getTime() ?? Infinity),
  );
  const newestFirst = (a: T, b: T) =>
    bySortOrder(a, b) ||
    (eventEndsAt(b)?.getTime() ?? 0) - (eventEndsAt(a)?.getTime() ?? 0);
  past.sort(newestFirst);
  collaborations.sort(newestFirst);

  return { upcoming, past, collaborations };
}

/* ---------- Validasi input admin ---------- */

/** Slug yang bentrok dengan route statis di bawah /events. */
export const RESERVED_EVENT_SLUGS: readonly string[] = ["collaborations"];

/** Pesan galat slug event, atau null bila valid. */
export function eventSlugError(slug: string): string | null {
  if (!slug) return "Slug wajib diisi.";
  if (!SLUG_PATTERN.test(slug)) {
    return "Slug hanya boleh huruf kecil, angka, dan tanda hubung.";
  }
  if (RESERVED_EVENT_SLUGS.includes(slug)) {
    return `Slug "${slug}" dipakai halaman lain (/events/${slug}). Pilih slug lain.`;
  }
  return null;
}

/**
 * Validasi pasangan tanggal event (sudah dalam bentuk Date WIB).
 * Tanggal selesai boleh sama dengan tanggal mulai (event satu hari).
 */
export function eventDatesError(start: Date | null, end: Date | null): string | null {
  if (end && !start) return "Isi tanggal mulai terlebih dahulu bila tanggal selesai diisi.";
  if (start && end && end.getTime() < start.getTime()) {
    return "Tanggal selesai tidak boleh sebelum tanggal mulai.";
  }
  return null;
}

/**
 * Merapikan tautan mitra. "" → null; "kama.id" → "https://kama.id".
 * Mengembalikan undefined bila bukan tautan http(s) yang sah.
 */
export function normalizePartnerUrl(value: string | null | undefined): string | null | undefined {
  const raw = value?.trim() ?? "";
  if (!raw) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw.replace(/^\/+/, "")}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    if (!url.hostname.includes(".")) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

/* ---------- Format tanggal ---------- */

const dayFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: EVENT_TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
});

const wibDayKey = (date: Date) =>
  Math.floor((date.getTime() + WIB_OFFSET_MS) / DAY_MS);

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
