/**
 * Bentuk baris database `SiteSettings` modul Kontak & Umum — lihat
 * `site-settings.ts`.
 */

/**
 * Kolom `SiteSettings` milik modul Kontak & Umum. Kolom SEO (`gscVerification`,
 * `faviconUrl`, `defaultOgImageUrl`) sengaja tidak ada di sini: diedit modul SEO.
 */
export type SiteSettingsRow = {
  address: string | null;
  mapsEmbedUrl: string | null;
  openingHours: string[];
  whatsappNumber: string | null;
  email: string | null;
  phone: string | null;
  instagramUrl: string | null;
  instagramUsername: string | null;
  tiktokUrl: string | null;
  facebookUrl: string | null;
  freshaUrl: string | null;
  ga4MeasurementId: string | null;
  footerTagline: string | null;
  footerMembershipTitle: string | null;
  footerMembershipLearnLabel: string | null;
  footerMembershipJoinLabel: string | null;
  partnershipIntro: string | null;
  partnershipEmail: string | null;
  priceDisclaimer: string | null;
  bookNowLabel: string | null;
  bookNowHref: string | null;
  menuScanUrls: string[];
  menuPdfUrl: string | null;
  logoMarkLightUrl: string | null;
  logoMarkDarkUrl: string | null;
  logoLockupUrl: string | null;
  brandWordmarkTop: string | null;
  brandWordmarkBottom: string | null;
  brandLogoAlt: string | null;
  seoSiteName: string | null;
  seoDefaultTitle: string | null;
  seoDefaultDescription: string | null;
  seoOgDescription: string | null;
  seoOgLocale: string | null;
  seoTitleTemplate: string | null;
  seoKeywords: string[];
  footerMembershipLearnHref: string | null;
  footerPrivacyHref: string | null;
  footerTermsHref: string | null;
};

/** Nilai yang ditulis ke database oleh form Kontak & Umum. */
export type SiteSettingsWrite = SiteSettingsRow;