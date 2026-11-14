/** Isian mentah form admin Kontak & Umum — lihat `site-settings.ts`. */

/** Isian mentah form admin (semua string, jam operasional berupa daftar). */
export type SiteSettingsInput = {
  address: string;
  openingHours: string[];
  whatsappNumber: string;
  email: string;
  phone: string;
  instagramUrl: string;
  instagramUsername: string;
  tiktokUrl: string;
  facebookUrl: string;
  freshaUrl: string;
  mapsEmbedUrl: string;
  ga4MeasurementId: string;
  footerTagline: string;
  footerMembershipTitle: string;
  footerMembershipLearnLabel: string;
  footerMembershipJoinLabel: string;
  partnershipIntro: string;
  partnershipEmail: string;
  priceDisclaimer: string;
  bookNowLabel: string;
  bookNowHref: string;
  menuScanUrls: string[];
  menuPdfUrl: string;
  logoMarkLightUrl: string;
  logoMarkDarkUrl: string;
  logoLockupUrl: string;
  brandWordmarkTop: string;
  brandWordmarkBottom: string;
  brandLogoAlt: string;
  seoSiteName: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  seoOgDescription: string;
  seoOgLocale: string;
  seoTitleTemplate: string;
  seoKeywords: string[];
  footerMembershipLearnHref: string;
  footerPrivacyHref: string;
  footerTermsHref: string;
};

export const MAX_FOOTER_TAGLINE = 400;
export const MAX_FOOTER_MEMBERSHIP_TITLE = 160;
export const MAX_FOOTER_MEMBERSHIP_LABEL = 60;
export const MAX_PARTNERSHIP_INTRO = 120;
export const MAX_PRICE_DISCLAIMER = 300;
export const MAX_BOOK_NOW_LABEL = 40;
export const MAX_MENU_SCANS = 30;