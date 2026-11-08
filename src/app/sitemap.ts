import type { MetadataRoute } from "next";

import { getCatalogSlugs } from "@/lib/content/catalog";
import { getEventSlugs } from "@/lib/content/events";
import { getJournalPosts } from "@/lib/content/journal";
import { getPublishedPageSlugs } from "@/lib/content/pages";
import { getActivePromos } from "@/lib/content/promos";
import { getSitemapTimestamps } from "@/lib/content/seo";
import { PUBLIC_STATIC_ROUTES } from "@/lib/domain/seo";
import { getSiteUrl } from "@/lib/site-url";

/**
 * `/sitemap.xml`, di-generate dari database.
 *
 * Route publik tetap berasal dari `PUBLIC_STATIC_ROUTES` (urutan = prioritas),
 * lalu halaman dinamis diambil dari bacaan publik tiap modul — sehingga hanya
 * konten terbit/aktif yang masuk. `lastModified` diambil dari `updatedAt`.
 * Route admin dan API sengaja tidak dimasukkan — lihat `robots.ts`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const url = (path: string) => (path === "/" ? siteUrl : `${siteUrl}${path}`);

  const [catalog, posts, eventSlugs, promos, pages, stamps] = await Promise.all([
    getCatalogSlugs(),
    getJournalPosts(),
    getEventSlugs(),
    getActivePromos(),
    getPublishedPageSlugs(),
    getSitemapTimestamps(),
  ]);

  const entries: MetadataRoute.Sitemap = PUBLIC_STATIC_ROUTES.map((route) => ({
    url: url(route.path),
    lastModified: stamps.sections[route.group],
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

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
