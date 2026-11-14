/**
 * Tipe pengaturan situs yang dipakai halaman publik (sudah digabung fallback).
 * Bagian dari modul Kontak & Umum — lihat `site-settings.ts`.
 */

/** Pengaturan situs yang dipakai halaman publik (sudah digabung fallback). */
export type SiteSettings = {
  address: string;
  openingHours: string[];
  /** Digit saja, format internasional (mis. `6281316052040`). */
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
  /** Tagline di footer. */
  footerTagline: string;
  /** CTA membership di footer. */
  footerMembershipTitle: string;
  footerMembershipLearnLabel: string;
  footerMembershipJoinLabel: string;
  /** Blok partnership di footer. */
  partnershipIntro: string;
  partnershipEmail: string;
  /** Catatan harga di halaman menu. */
  priceDisclaimer: string;
  /** Label & tujuan tombol Book Now di header; kosong → tombol disembunyikan. */
  bookNowLabel: string;
  bookNowHref: string;
  /** Halaman scan menu book, berurutan. */
  menuScanUrls: string[];
  /** Berkas PDF menu yang bisa diunduh. */
  menuPdfUrl: string;
  /** Identitas brand (mark header, lockup footer/hero, wordmark, alt). */
  logoMarkLightUrl: string;
  logoMarkDarkUrl: string;
  logoLockupUrl: string;
  brandWordmarkTop: string;
  brandWordmarkBottom: string;
  brandLogoAlt: string;
  /** SEO root: nama situs, judul/deskripsi bawaan, keywords, locale, template. */
  seoSiteName: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  seoOgDescription: string;
  seoOgLocale: string;
  seoTitleTemplate: string;
  seoKeywords: string[];
  /** Tujuan tautan struktural footer. */
  footerMembershipLearnHref: string;
  footerPrivacyHref: string;
  footerTermsHref: string;
};