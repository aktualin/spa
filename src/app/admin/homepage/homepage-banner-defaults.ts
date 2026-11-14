import {
  BOOKING_BANNER_DEFAULTS,
  HERO_DEFAULTS,
  type BannerDefaults,
  type BannerKey,
} from "@/lib/domain/homepage-banner";

/** Teks/gambar bawaan banner — ditampilkan sebagai placeholder di form. */
export const BANNER_DEFAULTS: Record<BannerKey, BannerDefaults> = {
  hero: HERO_DEFAULTS,
  "membership-banner": {
    title: "KAMA Membership.",
    subtitle: "",
    imageUrl: "",
    imageAlt: "",
    ctaLabel: "Join KAMA Now",
    ctaHref: "/membership",
  },
  "booking-banner": BOOKING_BANNER_DEFAULTS,
};