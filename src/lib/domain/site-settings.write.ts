/** Hasil validasi → data tulisan database — lihat `site-settings.ts`. */
import type { SiteSettingsWrite } from "./site-settings.row.ts";
import type { SiteSettingsParsed } from "./site-settings.schema.ts";

/** Hasil validasi → data yang ditulis (string kosong menjadi `null`). */
export function toSiteSettingsWrite(parsed: SiteSettingsParsed): SiteSettingsWrite {
  const orNull = (value: string) => (value.trim() ? value.trim() : null);
  return {
    address: parsed.address,
    openingHours: parsed.openingHours,
    whatsappNumber: parsed.whatsappNumber,
    email: parsed.email,
    phone: orNull(parsed.phone),
    instagramUrl: orNull(parsed.instagramUrl),
    instagramUsername: orNull(parsed.instagramUsername),
    tiktokUrl: orNull(parsed.tiktokUrl),
    facebookUrl: orNull(parsed.facebookUrl),
    freshaUrl: orNull(parsed.freshaUrl),
    mapsEmbedUrl: orNull(parsed.mapsEmbedUrl),
    ga4MeasurementId: orNull(parsed.ga4MeasurementId),
    footerTagline: orNull(parsed.footerTagline),
    footerMembershipTitle: orNull(parsed.footerMembershipTitle),
    footerMembershipLearnLabel: orNull(parsed.footerMembershipLearnLabel),
    footerMembershipJoinLabel: orNull(parsed.footerMembershipJoinLabel),
    partnershipIntro: orNull(parsed.partnershipIntro),
    partnershipEmail: orNull(parsed.partnershipEmail),
    priceDisclaimer: orNull(parsed.priceDisclaimer),
    bookNowLabel: orNull(parsed.bookNowLabel),
    bookNowHref: orNull(parsed.bookNowHref),
    menuScanUrls: parsed.menuScanUrls,
    menuPdfUrl: orNull(parsed.menuPdfUrl),
    logoMarkLightUrl: orNull(parsed.logoMarkLightUrl),
    logoMarkDarkUrl: orNull(parsed.logoMarkDarkUrl),
    logoLockupUrl: orNull(parsed.logoLockupUrl),
    brandWordmarkTop: orNull(parsed.brandWordmarkTop),
    brandWordmarkBottom: orNull(parsed.brandWordmarkBottom),
    brandLogoAlt: orNull(parsed.brandLogoAlt),
    seoSiteName: orNull(parsed.seoSiteName),
    seoDefaultTitle: orNull(parsed.seoDefaultTitle),
    seoDefaultDescription: orNull(parsed.seoDefaultDescription),
    seoOgDescription: orNull(parsed.seoOgDescription),
    seoOgLocale: orNull(parsed.seoOgLocale),
    seoTitleTemplate: orNull(parsed.seoTitleTemplate),
    seoKeywords: parsed.seoKeywords,
    footerMembershipLearnHref: orNull(parsed.footerMembershipLearnHref),
    footerPrivacyHref: orNull(parsed.footerPrivacyHref),
    footerTermsHref: orNull(parsed.footerTermsHref),
  };
}