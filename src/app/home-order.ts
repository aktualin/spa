import type { HomepageSection } from "@/lib/content/homepage";

export type VisibleHomeSection = {
  key: string;
  index: number;
  section: HomepageSection;
};

/**
 * Section homepage yang tampil, terurut: urutan bawaan dulu, lalu
 * `sortOrder` dari admin (index jadi tie-breaker). Section yang
 * dinonaktifkan TIDAK ikut — bukan disembunyikan dengan CSS.
 */
export function visibleHomeSections(
  sections: Record<string, HomepageSection>,
): VisibleHomeSection[] {
  const order = [
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
    // Section konten bebas buatan admin ikut diurutkan bersama section bawaan.
    ...Object.keys(sections).filter((key) => key.startsWith("custom-")),
  ];

  return order
    .map((key, index) => ({ key, index, section: sections[key] }))
    .filter(({ section }) => !!section && section.isEnabled)
    .sort((a, b) => {
      const diff = (a.section?.sortOrder ?? a.index) - (b.section?.sortOrder ?? b.index);
      return diff !== 0 ? diff : a.index - b.index;
    });
}