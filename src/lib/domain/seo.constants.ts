/** Konstanta SEO root — lihat `seo.ts`. */

export const SITE_NAME = "KAMA Spa";
export const TITLE_SEPARATOR = " • ";
export const TITLE_TEMPLATE = `%s${TITLE_SEPARATOR}${SITE_NAME}`;
export const DEFAULT_TITLE = "KAMA Spa • Wellness Sanctuary di South Jakarta";
export const DEFAULT_DESCRIPTION =
  "KAMA Spa adalah wellness sanctuary di jantung South Jakarta. Memadukan teknik penyembuhan tradisional dengan pendekatan wellness modern untuk treatments, massage, dan corporate wellness.";
export const DEFAULT_OG_DESCRIPTION =
  "Combining traditional healing techniques and modern wellness approaches, KAMA Spa offers thoughtfully curated treatments designed to restore balance, relaxation, and mindful presence.";
export const OG_LOCALE = "id_ID";

/** Panjang ideal yang dipakai Google sebelum teks dipotong. */
export const SEO_LIMITS = {
  titleMin: 30,
  titleMax: 60,
  descriptionMin: 70,
  descriptionMax: 160,
} as const;