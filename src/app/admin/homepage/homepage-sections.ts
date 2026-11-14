/**
 * Daftar key section homepage yang dikenali admin.
 *
 * Berisi konstanta (bukan Server Action), jadi file ini tidak memakai
 * `"use server"`. Baris section yang belum ada di database dibuat admin lewat
 * tombol "Tambahkan section". Status awalnya mengikuti tampilan homepage
 * sekarang, sehingga homepage publik tidak berubah saat baris dibuat:
 * - section bawaan (hero … booking-banner, footer) sudah tampil walau belum
 *   ada barisnya → dibuat AKTIF;
 * - section baru (signature-treatments, promo-highlight, gallery-teaser) →
 *   dibuat MATI sampai admin menyalakannya.
 * Lihat `isDefaultVisibleSection` di `@/lib/domain/homepage`.
 *
 * Barrel: key/label di homepage-section-keys, asal konten di
 * homepage-section-source.
 */

export {
  HOMEPAGE_SECTION_KEYS,
  type HomepageSectionKey,
  CUSTOM_SECTION_PREFIX,
  isCustomSectionKey,
  customSectionKey,
  sectionKeyLabel,
  TEXT_EDITABLE_SECTION_KEYS,
  hasEditableText,
  hasEditableCta,
} from "./homepage-section-keys.ts";
export { SECTION_SOURCE } from "./homepage-section-source.ts";