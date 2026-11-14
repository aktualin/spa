/** Validasi input admin event — lihat `events.ts`. */
import { SLUG_PATTERN } from "./slug.ts";

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