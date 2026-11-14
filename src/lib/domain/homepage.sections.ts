/** Section bawaan homepage — lihat `homepage.ts`. */

/**
 * Section yang tampil walaupun barisnya belum ada di database (komposisi
 * homepage lama + footer). Saat admin menambahkan barisnya, section ini
 * dibuat dalam keadaan AKTIF supaya homepage tidak berubah.
 */
export const DEFAULT_VISIBLE_SECTION_KEYS = [
  "hero",
  "membership-banner",
  "whats-new",
  "reviews",
  "brand-intro",
  "socials",
  "booking-banner",
  "footer",
] as const;

export function isDefaultVisibleSection(key: string): boolean {
  return (DEFAULT_VISIBLE_SECTION_KEYS as readonly string[]).includes(key);
}

/**
 * Section yang posisinya tetap (tidak ikut diurutkan): footer selalu di
 * paling bawah halaman, di luar `<main>`.
 */
export const FIXED_POSITION_SECTION_KEYS = ["footer"] as const;

export function isFixedPositionSection(key: string): boolean {
  return (FIXED_POSITION_SECTION_KEYS as readonly string[]).includes(key);
}

/**
 * Section yang hanya punya tombol tampil/sembunyi (tanpa isian teks/gambar).
 * Footer berisi data global situs (Pengaturan & Menu Navigasi).
 */
export function isToggleOnlySection(key: string): boolean {
  return key === "footer";
}