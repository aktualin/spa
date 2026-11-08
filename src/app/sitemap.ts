import type { MetadataRoute } from "next";

import { getCatalogSlugs } from "@/lib/content/catalog";
import { getEventSlugs } from "@/lib/content/events";
import { getJournalPosts } from "@/lib/content/journal";
import { getPublishedPageSlugs } from "@/lib/content/pages";
import { getActivePromos } from "@/lib/content/promos";
import { getSiteUrl } from "@/lib/site-url";

/**
 * `/sitemap.xml`.
 *
 * Route publik statis ditulis manual (urutannya mencerminkan prioritas), lalu
 * halaman dinamis diambil dari database. Route admin dan API sengaja tidak
 * dimasukkan — lihat `robots.ts`.
 */

/** Route publik yang selalu ada, beserta bobot prioritasnya. */
const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "treatments", priority: 0.9 },
  { path: "treatments/packages", priority: 0.8 },
  { path: "menu", priority: 0.8 },
  { path: "promos", priority: 0.8 },
  { path: "membership", priority: 0.7 },
  { path: "promos/membership", priority: 0.7 },
  { path: "corporate-wellness", priority: 0.7 },
  { path: "corporate", priority: 0.6 },
  { path: "our-story", priority: 0.6 },
  { path: "our-story/journal", priority: 0.6 },
  { path: "gallery", priority: 0.6 },
  { path: "events", priority: 0.6 },
  { path: "events/collaborations", priority: 0.5 },
  { path: "retail", priority: 0.5 },
  { path: "gift-card", priority: 0.5 },
  { path: "contact", priority: 0.7 },
  { path: "privacy-policy", priority: 0.2 },
  { path: "terms-conditions", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const url = (path: string) => (path ? `${siteUrl}/${path}` : siteUrl);

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: url(route.path),
    changeFrequency: "monthly",
    priority: route.priority,
  }));

  const [catalog, posts, eventSlugs, promos, pages] = await Promise.all([
    getCatalogSlugs(),
    getJournalPosts(),
    getEventSlugs(),
    getActivePromos(),
    getPublishedPageSlugs(),
  ]);

  for (const slug of catalog.categories) {
    entries.push({
      url: url(`treatments/${slug}`),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const { categorySlug, treatmentSlug } of catalog.treatments) {
    entries.push({
      url: url(`treatments/${categorySlug}/${treatmentSlug}`),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const slug of catalog.packages) {
    entries.push({
      url: url(`treatments/packages/${slug}`),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const post of posts) {
    entries.push({
      url: url(`our-story/journal/${post.slug}`),
      lastModified: post.publishedAt ?? undefined,
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }

  for (const slug of eventSlugs) {
    entries.push({
      url: url(`events/${slug}`),
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  for (const promo of promos) {
    entries.push({
      url: url(`promos/${promo.slug}`),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const page of pages) {
    entries.push({
      url: url(page.slug),
      lastModified: page.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}
