/** Tipe bacaan section homepage — lihat `homepage.ts`. */
import type { HeroSlideMediaType } from "@/lib/domain/hero-slide";

export type HomepageSectionKey =
  | "hero"
  | "membership-banner"
  | "whats-new"
  | "reviews"
  | "brand-intro"
  | "socials"
  | "booking-banner"
  | "signature-treatments"
  | "promo-highlight"
  | "gallery-teaser"
  | "footer";

export type HomepageSection = {
  key: HomepageSectionKey;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  bodyHtml: string | null;
  imageUrl: string | null;
  /** Banner/hero: gambar khusus layar kecil, teks alt, dan tombol ajakan. */
  mobileImageUrl: string | null;
  imageAlt: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  isEnabled: boolean;
  sortOrder: number;
};

/** Baris `HeroSlide` yang siap dipakai resolver slider hero. */
export type HeroSlideRow = {
  id: string;
  mediaType: HeroSlideMediaType;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  videoUrl: string | null;
  imageAlt: string | null;
  isPublished: boolean;
  sortOrder: number;
};