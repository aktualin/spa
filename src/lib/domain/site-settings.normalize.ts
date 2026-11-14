/** Normalisasi GA4, jam operasional, dan daftar URL — lihat `site-settings.ts`. */
import { collapseSpaces } from "./text.ts";

const GA4_ID = /^G-[A-Z0-9]{6,12}$/;

/** Normalisasi Measurement ID GA4 (`g-abc…` → `G-ABC…`); `null` bila salah format. */
export function normalizeGa4Id(input: string): string | null {
  const value = input.trim().toUpperCase();
  return GA4_ID.test(value) ? value : null;
}

export const MAX_OPENING_HOURS = 14;
export const MAX_OPENING_HOURS_LENGTH = 120;

/** Rapikan baris jam operasional: trim, buang baris kosong, urutan dipertahankan. */
export function normalizeOpeningHours(lines: readonly string[]): string[] {
  return lines.map((line) => collapseSpaces(line)).filter(Boolean);
}

/** Rapikan daftar URL gambar: trim, buang yang kosong, urutan dipertahankan. */
export function normalizeMenuScanUrls(urls: readonly string[]): string[] {
  return urls.map((url) => url.trim()).filter(Boolean);
}