/** Penggabungan baris database + fallback — lihat `site-settings.ts`. */
import { isSafeCtaHref, isSafeImageUrl } from "./homepage-banner.ts";
import { emptySiteSettings } from "./site-settings.empty.ts";
import { parseMapsEmbedInput } from "./site-settings.maps.ts";
import {
  normalizeGa4Id,
  normalizeMenuScanUrls,
  normalizeOpeningHours,
} from "./site-settings.normalize.ts";
import { normalizeWhatsAppNumber } from "./site-settings.phone.ts";
import type { SiteSettingsRow } from "./site-settings.row.ts";
import {
  instagramUsernameFromUrl,
  isHttpsUrl,
  normalizeInstagramUsername,
} from "./site-settings.social.ts";
import type { SiteSettings } from "./site-settings.types.ts";

/**
 * Baris database → nilai yang dipakai halaman publik.
 *
 * Tanpa baris (belum pernah disimpan / DB gagal) → seluruh nilai kosong, dan
 * halaman menampilkan empty state. Kolom yang kosong atau tidak valid juga
 * tetap kosong: tidak ada nilai hardcode yang menimpa data admin.
 * Username Instagram kosong masih boleh diturunkan dari URL Instagram karena
 * keduanya data admin yang sama.
 */
export function mergeSiteSettings(row: SiteSettingsRow | null): SiteSettings {
  if (!row) return emptySiteSettings();

  const text = (value: string | null | undefined) => value?.trim() ?? "";
  const optionalUrl = (value: string | null) =>
    isHttpsUrl(text(value)) ? text(value) : "";
  const safeImage = (value: string | null) =>
    isSafeImageUrl(text(value)) ? text(value) : "";
  const safeHref = (value: string | null) =>
    isSafeCtaHref(text(value)) ? text(value) : "";
  const instagramUrl = optionalUrl(row.instagramUrl);

  return {
    address: text(row.address),
    openingHours: normalizeOpeningHours(row.openingHours ?? []),
    whatsappNumber: normalizeWhatsAppNumber(text(row.whatsappNumber)) ?? "",
    email: text(row.email),
    phone: text(row.phone),
    instagramUrl,
    instagramUsername:
      normalizeInstagramUsername(text(row.instagramUsername)) ??
      instagramUsernameFromUrl(instagramUrl) ??
      "",
    tiktokUrl: optionalUrl(row.tiktokUrl),
    facebookUrl: optionalUrl(row.facebookUrl),
    freshaUrl: optionalUrl(row.freshaUrl),
    mapsEmbedUrl: parseMapsEmbedInput(text(row.mapsEmbedUrl)) ?? "",
    ga4MeasurementId: normalizeGa4Id(text(row.ga4MeasurementId)) ?? "",
    footerTagline: text(row.footerTagline),
    footerMembershipTitle: text(row.footerMembershipTitle),
    footerMembershipLearnLabel: text(row.footerMembershipLearnLabel),
    footerMembershipJoinLabel: text(row.footerMembershipJoinLabel),
    partnershipIntro: text(row.partnershipIntro),
    partnershipEmail: text(row.partnershipEmail),
    priceDisclaimer: text(row.priceDisclaimer),
    bookNowLabel: text(row.bookNowLabel),
    // Tujuan yang tidak aman diperlakukan kosong supaya tombolnya disembunyikan,
    // bukan dirender dengan tautan yang bisa menyesatkan.
    bookNowHref: isSafeCtaHref(text(row.bookNowHref)) ? text(row.bookNowHref) : "",
    menuScanUrls: normalizeMenuScanUrls(row.menuScanUrls ?? []).filter(isSafeImageUrl),
    menuPdfUrl: isSafeCtaHref(text(row.menuPdfUrl)) ? text(row.menuPdfUrl) : "",
    logoMarkLightUrl: safeImage(row.logoMarkLightUrl),
    logoMarkDarkUrl: safeImage(row.logoMarkDarkUrl),
    logoLockupUrl: safeImage(row.logoLockupUrl),
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
    footerMembershipLearnHref: safeHref(row.footerMembershipLearnHref),
    footerPrivacyHref: safeHref(row.footerPrivacyHref),
    footerTermsHref: safeHref(row.footerTermsHref),
  };
}