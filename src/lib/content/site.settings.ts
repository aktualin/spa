/** Bacaan pengaturan situs publik — lihat `site.ts`. */
import { cacheLife, cacheTag } from "next/cache";

import {
  emptySiteSettings,
  mergeSiteSettings,
  type SiteSettings,
} from "@/lib/domain/site-settings";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

/**
 * Pengaturan situs (alamat, jam, WA, email, sosial, maps, username IG, GA4).
 * Kolom yang belum diisi admin dikembalikan kosong — lihat `mergeSiteSettings`.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(CONTENT_TAGS.settings);

  const { data, usedFallback } = await safeQueryWithMeta<SiteSettings>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.siteSettings.findUnique({
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
          seoSiteName: true,
          seoDefaultTitle: true,
          seoDefaultDescription: true,
          seoOgDescription: true,
          seoOgLocale: true,
          seoTitleTemplate: true,
          seoKeywords: true,
          footerMembershipLearnHref: true,
          footerPrivacyHref: true,
          footerTermsHref: true,
        },
      });
      return mergeSiteSettings(row);
    },
    emptySiteSettings(),
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}