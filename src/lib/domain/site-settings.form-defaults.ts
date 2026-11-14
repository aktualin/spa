/** Nilai awal form admin Kontak & Umum — lihat `site-settings.ts`. */
import type { SiteSettingsInput } from "./site-settings.input.ts";
import { mergeSiteSettings } from "./site-settings.merge.ts";
import {
  normalizeMenuScanUrls,
  normalizeOpeningHours,
} from "./site-settings.normalize.ts";
import type { SiteSettingsRow } from "./site-settings.row.ts";

/** Field yang di form admin diisi dari nilai bawaan karena kolomnya kosong. */
export type FormDefaults = {
  values: SiteSettingsInput;
  /** Label field yang terisi otomatis dari tampilan situs saat ini. */
  prefilled: string[];
  /** true bila baris `SiteSettings` belum ada sama sekali. */
  noRow: boolean;
};

/**
 * Nilai awal form admin: isi database, atau — bila kolom wajib kosong —
 * nilai yang saat ini tampil di situs, disertai daftar field yang terisi
 * otomatis untuk pemberitahuan kuning.
 */
export function siteSettingsFormDefaults(row: SiteSettingsRow | null): FormDefaults {
  const shown = mergeSiteSettings(row);
  const text = (value: string | null | undefined) => value?.trim() ?? "";
  const prefilled: string[] = [];

  if (!row) {
    return {
      values: { ...shown, openingHours: [...shown.openingHours] },
      prefilled: [],
      noRow: true,
    };
  }

  const pick = (stored: string, displayed: string, label: string) => {
    if (stored) return stored;
    if (displayed) prefilled.push(label);
    return displayed;
  };

  const hours = normalizeOpeningHours(row.openingHours ?? []);
  if (hours.length === 0) prefilled.push("Jam operasional");

  return {
    values: {
      address: pick(text(row.address), shown.address, "Alamat"),
      openingHours: hours.length > 0 ? hours : [...shown.openingHours],
      whatsappNumber: pick(text(row.whatsappNumber), shown.whatsappNumber, "Nomor WhatsApp"),
      email: pick(text(row.email), shown.email, "Email"),
      phone: text(row.phone),
      instagramUrl: text(row.instagramUrl),
      instagramUsername: pick(
        text(row.instagramUsername),
        text(row.instagramUrl) ? shown.instagramUsername : "",
        "Username Instagram",
      ),
      tiktokUrl: text(row.tiktokUrl),
      facebookUrl: text(row.facebookUrl),
      freshaUrl: text(row.freshaUrl),
      mapsEmbedUrl: text(row.mapsEmbedUrl),
      ga4MeasurementId: text(row.ga4MeasurementId),
      footerTagline: text(row.footerTagline),
      footerMembershipTitle: text(row.footerMembershipTitle),
      footerMembershipLearnLabel: text(row.footerMembershipLearnLabel),
      footerMembershipJoinLabel: text(row.footerMembershipJoinLabel),
      partnershipIntro: text(row.partnershipIntro),
      partnershipEmail: text(row.partnershipEmail),
      priceDisclaimer: text(row.priceDisclaimer),
      bookNowLabel: text(row.bookNowLabel),
      bookNowHref: text(row.bookNowHref),
      menuScanUrls: normalizeMenuScanUrls(row.menuScanUrls ?? []),
      menuPdfUrl: text(row.menuPdfUrl),
      logoMarkLightUrl: text(row.logoMarkLightUrl),
      logoMarkDarkUrl: text(row.logoMarkDarkUrl),
      logoLockupUrl: text(row.logoLockupUrl),
      brandWordmarkTop: text(row.brandWordmarkTop),
      brandWordmarkBottom: text(row.brandWordmarkBottom),
      brandLogoAlt: text(row.brandLogoAlt),
      seoSiteName: text(row.seoSiteName),
      seoDefaultTitle: text(row.seoDefaultTitle),
      seoDefaultDescription: text(row.seoDefaultDescription),
      seoOgDescription: text(row.seoOgDescription),
      seoOgLocale: text(row.seoOgLocale),
      seoTitleTemplate: text(row.seoTitleTemplate),
      seoKeywords: normalizeMenuScanUrls(row.seoKeywords ?? []),
      footerMembershipLearnHref: text(row.footerMembershipLearnHref),
      footerPrivacyHref: text(row.footerPrivacyHref),
      footerTermsHref: text(row.footerTermsHref),
    },
    prefilled,
    noRow: false,
  };
}