/** Nilai kosong modul Kontak & Umum — lihat `site-settings.ts`. */
import type { SiteSettings } from "./site-settings.types.ts";

/**
 * Pengaturan kosong — dipakai saat baris `SiteSettings` belum ada atau DB
 * tidak terjangkau. Halaman publik menyembunyikan bagian yang nilainya kosong.
 */
export function emptySiteSettings(): SiteSettings {
  return {
    address: "",
    openingHours: [],
    whatsappNumber: "",
    email: "",
    phone: "",
    instagramUrl: "",
    instagramUsername: "",
    tiktokUrl: "",
    facebookUrl: "",
    freshaUrl: "",
    mapsEmbedUrl: "",
    ga4MeasurementId: "",
    footerTagline: "",
    footerMembershipTitle: "",
    footerMembershipLearnLabel: "",
    footerMembershipJoinLabel: "",
    partnershipIntro: "",
    partnershipEmail: "",
    priceDisclaimer: "",
    bookNowLabel: "",
    bookNowHref: "",
    menuScanUrls: [],
    menuPdfUrl: "",
    logoMarkLightUrl: "",
    logoMarkDarkUrl: "",
    logoLockupUrl: "",
    brandWordmarkTop: "",
    brandWordmarkBottom: "",
    brandLogoAlt: "",
    seoSiteName: "",
    seoDefaultTitle: "",
    seoDefaultDescription: "",
    seoOgDescription: "",
    seoOgLocale: "",
    seoTitleTemplate: "",
    seoKeywords: [],
    footerMembershipLearnHref: "",
    footerPrivacyHref: "",
    footerTermsHref: "",
  };
}