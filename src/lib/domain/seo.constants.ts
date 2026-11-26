/** Konstanta SEO root — lihat `seo.ts`. */

export const SITE_NAME = "KAMA Spa";
export const TITLE_SEPARATOR = " • ";
export const TITLE_TEMPLATE = `%s${TITLE_SEPARATOR}${SITE_NAME}`;
export const DEFAULT_TITLE = "KAMA Spa • Wellness Sanctuary in South Jakarta";
export const DEFAULT_DESCRIPTION =
  "KAMA Spa is a wellness sanctuary in South Jakarta, blending traditional healing with modern wellness across treatments, massage, and corporate wellness.";
export const DEFAULT_OG_DESCRIPTION =
  "Combining traditional healing techniques and modern wellness approaches, KAMA Spa offers thoughtfully curated treatments designed to restore balance, relaxation, and mindful presence.";
export const OG_LOCALE = "en_US";

/** Keywords cadangan bila admin belum mengisi daftar keywords di Kontak & Umum. */
export const FALLBACK_KEYWORDS: string[] = [
  "KAMA Spa",
  "massage Jakarta",
  "spa South Jakarta",
  "day spa",
  "corporate wellness",
  "Sukma Laya",
  "Urip Padma",
];

/** Panjang ideal yang dipakai Google sebelum teks dipotong. */
export const SEO_LIMITS = {
  titleMin: 30,
  titleMax: 60,
  descriptionMin: 70,
  descriptionMax: 160,
} as const;