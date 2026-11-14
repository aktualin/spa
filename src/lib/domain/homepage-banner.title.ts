/** Aturan judul tampil banner/section — lihat `homepage-banner.ts`. */
import { type BannerKey, isBannerKey } from "./homepage-banner.config.ts";

/**
 * Semua label admin yang pernah dipakai sebagai `title` (seed, fallback
 * `getHomepageSections`, dan `sectionKeyLabel`). Dibandingkan tanpa
 * membedakan huruf besar/kecil.
 */
const PLACEHOLDER_TITLES: Record<BannerKey, readonly string[]> = {
  hero: ["hero"],
  "membership-banner": ["membership banner", "banner membership", "membership-banner"],
  "booking-banner": ["booking banner", "banner booking", "booking-banner"],
};

/**
 * Label admin yang pernah tersimpan sebagai `title` pada section NON-banner
 * yang judulnya kini dirender di homepage. Tanpa ini, database lama yang masih
 * menyimpan label seed akan menampilkannya sebagai judul section.
 */
const LEGACY_SECTION_LABELS: Record<string, readonly string[]> = {
  "whats-new": ["promo / event highlight", "promo/event highlight", "whats new"],
};

/** true bila `title` hanyalah label admin (bukan teks untuk pengunjung). */
export function isPlaceholderTitle(key: string, title: string | null | undefined): boolean {
  const normalized = (title ?? "").trim().toLowerCase();
  if (!normalized) return true;
  if (normalized === key.toLowerCase()) return true;
  if (LEGACY_SECTION_LABELS[key]?.includes(normalized)) return true;
  if (!isBannerKey(key)) return false;
  return PLACEHOLDER_TITLES[key].includes(normalized);
}

/** Judul tampil dari `title`, atau null bila hanya label admin. */
export function displayTitle(key: string, title: string | null | undefined): string | null {
  return isPlaceholderTitle(key, title) ? null : (title ?? "").trim();
}