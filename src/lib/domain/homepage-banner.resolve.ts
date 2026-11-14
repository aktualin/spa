/** Penggabungan isian banner dengan nilai bawaan — lihat `homepage-banner.ts`. */
import { asset } from "../asset-url.ts";
import { displayTitle } from "./homepage-banner.title.ts";
import { isSafeCtaHref, isSafeImageUrl } from "./homepage-banner.url.ts";
import { clean } from "./text.ts";

/** Bentuk minimal section yang dibaca `resolveBanner`. */
export type BannerSectionLike = {
  key: string;
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  imageAlt?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

export type BannerDefaults = {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
};

export type ResolvedBanner = BannerDefaults & {
  /** null → tidak ada gambar khusus mobile; render `<img>` biasa. */
  mobileImageUrl: string | null;
};

/**
 * Gabungkan isian admin dengan nilai bawaan. Field kosong/null → bawaan.
 *
 * - Judul hanya diambil bila bukan label admin (`displayTitle`).
 * - Tombol hanya diganti bila label DAN tujuan sama-sama terisi dan tujuan
 *   lolos `isSafeCtaHref` (pertahanan kedua bila DB diisi di luar admin).
 * - Alt: isian admin bila ada; bila gambar diganti tanpa alt (hero
 *   dekoratif) → `""`; bila gambar bawaan → alt bawaan.
 */
export function resolveBanner(
  section: BannerSectionLike | null | undefined,
  defaults: BannerDefaults,
): ResolvedBanner {
  if (!section) return { ...defaults, mobileImageUrl: null };

  const subtitle = clean(section.subtitle);
  const imageUrl = clean(section.imageUrl);
  const mobileImageUrl = clean(section.mobileImageUrl);
  const imageAlt = clean(section.imageAlt);
  const ctaLabel = clean(section.ctaLabel);
  const ctaHref = clean(section.ctaHref);
  const useImage = imageUrl && isSafeImageUrl(imageUrl);
  const useCta = ctaLabel && ctaHref && isSafeCtaHref(ctaHref);

  return {
    title: displayTitle(section.key, section.title) ?? defaults.title,
    subtitle: subtitle || defaults.subtitle,
    imageUrl: useImage ? imageUrl : defaults.imageUrl,
    imageAlt: imageAlt || (useImage ? "" : defaults.imageAlt),
    ctaLabel: useCta ? ctaLabel : defaults.ctaLabel,
    ctaHref: useCta ? ctaHref : defaults.ctaHref,
    mobileImageUrl: mobileImageUrl && isSafeImageUrl(mobileImageUrl) ? mobileImageUrl : null,
  };
}

/** Nilai bawaan hero & booking banner. */
export const HERO_DEFAULTS: BannerDefaults = {
  title: "Relax. Refresh. (Repeat).",
  subtitle: "Massage • Spa • Corporate Wellness",
  imageUrl: asset("img/kama/incense-smoke-poster.jpg"),
  imageAlt: "",
  ctaLabel: "Book Now",
  ctaHref: "/contact",
};

export const BOOKING_BANNER_DEFAULTS: BannerDefaults = {
  title: "Have any questions? Drop us a line.",
  subtitle: "",
  imageUrl: "",
  imageAlt: "",
  ctaLabel: "Get In Touch",
  ctaHref: "/contact",
};

/** Media query `<source>` gambar mobile (di bawah breakpoint `md` Tailwind). */
export const MOBILE_MEDIA_QUERY = "(max-width: 767px)";