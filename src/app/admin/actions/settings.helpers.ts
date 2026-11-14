import type { SiteSettingsInput } from "@/lib/domain/site-settings";

import { formStr } from "./form-utils";

export type ActionState = { error: string | null; ok?: boolean };

/** State form Kontak & Umum: isian dikembalikan saat gagal agar tidak hilang. */
export type SiteSettingsFormState = ActionState & {
  values?: SiteSettingsInput;
  attempt?: number;
};

/** Membaca baris jam operasional dari form (openingHours[0], dst) sesuai urutan. */
function readOpeningHours(formData: FormData): string[] {
  const values: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("openingHours[")) continue;
    values.push(String(value));
  }
  return values;
}

export function readSiteSettingsInput(formData: FormData): SiteSettingsInput {
  const field = (name: string) => formStr(formData, name);
  return {
    address: field("address"),
    openingHours: readOpeningHours(formData),
    whatsappNumber: field("whatsappNumber"),
    email: field("email"),
    phone: field("phone"),
    instagramUrl: field("instagramUrl"),
    instagramUsername: field("instagramUsername"),
    tiktokUrl: field("tiktokUrl"),
    facebookUrl: field("facebookUrl"),
    freshaUrl: field("freshaUrl"),
    mapsEmbedUrl: field("mapsEmbedUrl"),
    ga4MeasurementId: field("ga4MeasurementId"),
    footerTagline: field("footerTagline"),
    footerMembershipTitle: field("footerMembershipTitle"),
    footerMembershipLearnLabel: field("footerMembershipLearnLabel"),
    footerMembershipJoinLabel: field("footerMembershipJoinLabel"),
    partnershipIntro: field("partnershipIntro"),
    partnershipEmail: field("partnershipEmail"),
    priceDisclaimer: field("priceDisclaimer"),
    bookNowLabel: field("bookNowLabel"),
    bookNowHref: field("bookNowHref"),
    // Satu URL per baris; baris kosong dibuang oleh normalizer di schema.
    menuScanUrls: field("menuScanUrls").split("\n"),
    menuPdfUrl: field("menuPdfUrl"),
    logoMarkLightUrl: field("logoMarkLightUrl"),
    logoMarkDarkUrl: field("logoMarkDarkUrl"),
    logoLockupUrl: field("logoLockupUrl"),
    brandWordmarkTop: field("brandWordmarkTop"),
    brandWordmarkBottom: field("brandWordmarkBottom"),
    brandLogoAlt: field("brandLogoAlt"),
    footerMembershipLearnHref: field("footerMembershipLearnHref"),
    footerPrivacyHref: field("footerPrivacyHref"),
    footerTermsHref: field("footerTermsHref"),
    // Kolom SEO teks diedit modul SEO (/admin/seo/settings), bukan form ini.
    // Nilai kosong hanya agar schema lengkap; penulisannya dikecualikan di bawah.
    seoSiteName: "",
    seoDefaultTitle: "",
    seoDefaultDescription: "",
    seoOgDescription: "",
    seoOgLocale: "",
    seoTitleTemplate: "",
    seoKeywords: [],
  };
}