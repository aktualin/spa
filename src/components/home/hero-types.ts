import type { HomepageSection } from "@/lib/content/homepage";
import type { PageCopy } from "@/lib/content/page-copy";
import type { HeroSlideView } from "@/lib/domain/hero-slide";

export type BannerProps = {
  section?: HomepageSection | null;
  copyBlocks: PageCopy;
};

export type HeroSliderLabels = {
  cardEyebrow: string;
  cardBody: string;
  scrollLabel: string;
  /** Lockup brand dari Kontak & Umum (sudah termasuk fallback aset). */
  lockupUrl: string;
  lockupAlt: string;
  /** Tujuan tautan menu (CB home.hero.menu_href). */
  menuHref: string;
  /** Aria grup slider & titik; dot memakai placeholder {n}/{m}. */
  sliderAria: string;
  dotAria: string;
};

export type HeroSliderProps = {
  section?: HomepageSection | null;
  labels: HeroSliderLabels;
  slides: HeroSlideView[];
};