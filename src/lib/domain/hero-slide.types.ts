/** Tipe slider media hero — lihat `hero-slide.ts`. */
import { BANNER_LIMITS } from "./homepage-banner.ts";

export const HERO_SLIDE_INTERVAL_MS = 6000;

export const HERO_SLIDE_LIMITS = {
  imageUrl: BANNER_LIMITS.imageUrl,
  videoUrl: 1000,
  imageAlt: BANNER_LIMITS.imageAlt,
} as const;

export type HeroSlideMediaType = "IMAGE" | "VIDEO";

export type HeroSlideRowLike = {
  id: string;
  mediaType: string;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  videoUrl?: string | null;
  imageAlt?: string | null;
  isPublished: boolean;
  sortOrder: number;
};

export type HeroSlideView = {
  key: string;
  mediaType: HeroSlideMediaType;
  imageUrl: string;
  mobileImageUrl: string | null;
  videoUrl: string | null;
  imageAlt: string;
};

export type HeroSlideSectionLike = {
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  imageAlt?: string | null;
};