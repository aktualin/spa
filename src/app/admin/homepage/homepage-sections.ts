/**
 * Daftar key section homepage yang dikenali admin.
 *
 * Berisi konstanta (bukan Server Action), jadi file ini tidak memakai
 * `"use server"`. Baris section yang belum ada di database dibuat admin lewat
 * tombol "Tambahkan section" dengan default `isEnabled: false`, sehingga
 * homepage publik tidak berubah sampai admin menyalakannya.
 */

export const HOMEPAGE_SECTION_KEYS = [
  "hero",
  "membership-banner",
  "whats-new",
  "reviews",
  "brand-intro",
  "socials",
  "booking-banner",
  "signature-treatments",
  "promo-highlight",
  "gallery-teaser",
] as const;

export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number];

const KEY_LABEL: Record<string, string> = {
  hero: "Hero",
  "membership-banner": "Banner Membership",
  "whats-new": "What's New",
  reviews: "Reviews",
  "brand-intro": "Brand Intro",
  socials: "Socials",
  "booking-banner": "Banner Booking",
  "signature-treatments": "Signature Treatments",
  "promo-highlight": "Promo Highlight",
  "gallery-teaser": "Gallery Teaser",
};

export function sectionKeyLabel(key: string): string {
  return KEY_LABEL[key] ?? key;
}
