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
  "footer",
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
  footer: "Footer",
};

/**
 * Section konten bebas buatan admin: key `custom-<slug>`. Isinya judul,
 * subjudul, isi HTML, gambar, dan tombol (form umum), dirender di homepage
 * sesuai urutan, dan — berbeda dengan section bawaan — boleh dihapus.
 */
export const CUSTOM_SECTION_PREFIX = "custom-";

export function isCustomSectionKey(key: string): boolean {
  return /^custom-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key);
}

/** "Promo Ramadan 2026!" → "custom-promo-ramadan-2026" (null bila tidak ada huruf/angka). */
export function customSectionKey(name: string): string | null {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  return slug ? `${CUSTOM_SECTION_PREFIX}${slug}` : null;
}

export function sectionKeyLabel(key: string): string {
  if (isCustomSectionKey(key)) return "Section konten";
  return KEY_LABEL[key] ?? key;
}

/**
 * Section non-banner yang judul/teksnya memang dirender di homepage, jadi
 * tetap diberi form isian walau kartunya diatur di modul lain.
 * `whats-new` juga memakai tombol ajakan (label + tujuan).
 */
export const TEXT_EDITABLE_SECTION_KEYS = ["whats-new", "reviews"] as const;

export function hasEditableText(key: string): boolean {
  return (TEXT_EDITABLE_SECTION_KEYS as readonly string[]).includes(key);
}

/** Section yang memakai tombol ajakan pada form umum. */
export function hasEditableCta(key: string): boolean {
  return key === "whats-new";
}