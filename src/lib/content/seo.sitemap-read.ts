/** Bacaan database stempel waktu sitemap — lihat `seo.sitemap.ts`. */
import { latestDate as latest } from "@/lib/domain/seo";

import type { SitemapTimestamps } from "./seo.sitemap";

function bySlug(rows: { slug: string; updatedAt: Date }[]): Record<string, Date> {
  return Object.fromEntries(rows.map((row) => [row.slug, row.updatedAt]));
}

/**
 * `updatedAt` seluruh konten untuk `lastModified` sitemap. Visibilitas
 * (terbit/aktif) TIDAK ditentukan di sini — sitemap tetap memakai daftar slug
 * dari bacaan publik masing-masing modul.
 */
export async function readSitemapTimestamps(): Promise<SitemapTimestamps> {
  const { prisma } = await import("@/lib/prisma");
  const slugAndDate = { select: { slug: true, updatedAt: true } } as const;
  const maxUpdated = { _max: { updatedAt: true } } as const;

  const [
    categories,
    treatments,
    packages,
    events,
    promos,
    journal,
    homepage,
    highlights,
    ourStory,
    membershipProgram,
    membershipTiers,
    corporate,
    corporatePrograms,
    gallery,
    retail,
    giftCard,
    settings,
  ] = await Promise.all([
    prisma.treatmentCategory.findMany(slugAndDate),
    prisma.treatment.findMany(slugAndDate),
    prisma.package.findMany(slugAndDate),
    prisma.eventItem.findMany(slugAndDate),
    prisma.promo.findMany(slugAndDate),
    prisma.journalPost.aggregate({ ...maxUpdated, where: { status: "PUBLISHED" } }),
    prisma.homepageSection.aggregate(maxUpdated),
    prisma.homepageHighlight.aggregate(maxUpdated),
    prisma.ourStoryContent.aggregate(maxUpdated),
    prisma.membershipProgram.aggregate(maxUpdated),
    prisma.membershipTier.aggregate(maxUpdated),
    prisma.corporateContent.aggregate(maxUpdated),
    prisma.corporateProgram.aggregate(maxUpdated),
    prisma.galleryAlbum.aggregate(maxUpdated),
    prisma.retailProduct.aggregate(maxUpdated),
    prisma.giftCardInfo.aggregate(maxUpdated),
    prisma.siteSettings.aggregate(maxUpdated),
  ]);

  const catalogDates = [...categories, ...treatments, ...packages].map(
    (row) => row.updatedAt,
  );

  return {
    sections: {
      home: latest(homepage._max.updatedAt, highlights._max.updatedAt),
      catalog: latest(...catalogDates),
      promos: latest(...promos.map((row) => row.updatedAt)),
      membership: latest(
        membershipProgram._max.updatedAt,
        membershipTiers._max.updatedAt,
      ),
      corporate: latest(corporate._max.updatedAt, corporatePrograms._max.updatedAt),
      story: latest(ourStory._max.updatedAt),
      journal: latest(journal._max.updatedAt),
      gallery: latest(gallery._max.updatedAt),
      events: latest(...events.map((row) => row.updatedAt)),
      retail: latest(retail._max.updatedAt),
      giftCard: latest(giftCard._max.updatedAt),
      contact: latest(settings._max.updatedAt),
    },
    categories: bySlug(categories),
    treatments: bySlug(treatments),
    packages: bySlug(packages),
    events: bySlug(events),
    promos: bySlug(promos),
  };
}