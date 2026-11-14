"use server";

import { prisma } from "@/lib/prisma";

import { requireModuleRole } from "../access";

export async function getSiteSettings() {
  await requireModuleRole("/admin/settings/contact");
  return prisma.siteSettings.findUnique({ where: { id: "singleton" } });
}

/** Bacaan admin kolom Kontak & Umum (teks SEO ikut dibaca, tidak ditulis). */
export async function getContactSettingsRow() {
  await requireModuleRole("/admin/settings/contact");
  return prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: {
      address: true,
      mapsEmbedUrl: true,
      openingHours: true,
      whatsappNumber: true,
      email: true,
      phone: true,
      instagramUrl: true,
      instagramUsername: true,
      tiktokUrl: true,
      facebookUrl: true,
      freshaUrl: true,
      ga4MeasurementId: true,
      footerTagline: true,
      footerMembershipTitle: true,
      footerMembershipLearnLabel: true,
      footerMembershipJoinLabel: true,
      partnershipIntro: true,
      partnershipEmail: true,
      priceDisclaimer: true,
      bookNowLabel: true,
      bookNowHref: true,
      menuScanUrls: true,
      menuPdfUrl: true,
      logoMarkLightUrl: true,
      logoMarkDarkUrl: true,
      logoLockupUrl: true,
      brandWordmarkTop: true,
      brandWordmarkBottom: true,
      brandLogoAlt: true,
      footerMembershipLearnHref: true,
      footerPrivacyHref: true,
      footerTermsHref: true,
      // Kolom SEO teks ikut dibaca agar baris lengkap untuk form defaults;
      // penulisannya tetap milik modul SEO.
      seoSiteName: true,
      seoDefaultTitle: true,
      seoDefaultDescription: true,
      seoOgDescription: true,
      seoOgLocale: true,
      seoTitleTemplate: true,
      seoKeywords: true,
    },
  });
}