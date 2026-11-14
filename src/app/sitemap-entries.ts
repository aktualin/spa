import type { MetadataRoute } from "next";

import type { getCatalogSlugs } from "@/lib/content/catalog";
import type { getJournalPosts } from "@/lib/content/journal";
import type { getPublishedPageSlugs } from "@/lib/content/pages";
import type { getActivePromos } from "@/lib/content/promos";
import type { getSitemapTimestamps } from "@/lib/content/seo";

/** Hasil bacaan publik tiap modul untuk entry sitemap dinamis. */
export type SitemapDynamicData = {
  catalog: Awaited<ReturnType<typeof getCatalogSlugs>>;
  posts: Awaited<ReturnType<typeof getJournalPosts>>;
  eventSlugs: string[];
  promos: Awaited<ReturnType<typeof getActivePromos>>;
  pages: Awaited<ReturnType<typeof getPublishedPageSlugs>>;
  stamps: Awaited<ReturnType<typeof getSitemapTimestamps>>;
};

/**
 * Entry dinamis (kategori/treatment/paket/journal/event/promo/halaman CMS).
 * Hanya konten terbit/aktif yang masuk; `lastModified` dari `updatedAt`.
 */
export function dynamicSitemapEntries(
  url: (path: string) => string,
  { catalog, posts, eventSlugs, promos, pages, stamps }: SitemapDynamicData,
): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const slug of catalog.categories) {
    entries.push({
      url: url(`/treatments/${slug}`),
      lastModified: stamps.categories[slug],
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const { categorySlug, treatmentSlug } of catalog.treatments) {
    entries.push({
      url: url(`/treatments/${categorySlug}/${treatmentSlug}`),
      lastModified: stamps.treatments[treatmentSlug],
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const slug of catalog.packages) {
    entries.push({
      url: url(`/treatments/packages/${slug}`),
      lastModified: stamps.packages[slug],
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const post of posts) {
    entries.push({
      url: url(`/our-story/journal/${post.slug}`),
      lastModified: post.updatedAt ?? post.publishedAt ?? undefined,
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }

  for (const slug of eventSlugs) {
    entries.push({
      url: url(`/events/${slug}`),
      lastModified: stamps.events[slug],
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  for (const promo of promos) {
    entries.push({
      url: url(`/promos/${promo.slug}`),
      lastModified: stamps.promos[promo.slug],
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const page of pages) {
    entries.push({
      url: url(`/${page.slug}`),
      lastModified: page.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}