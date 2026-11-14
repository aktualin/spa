import type { MetadataRoute } from "next";

import { getCatalogSlugs } from "@/lib/content/catalog";
import { getEventSlugs } from "@/lib/content/events";
import { getJournalPosts } from "@/lib/content/journal";
import { getPublishedPageSlugs } from "@/lib/content/pages";
import { getActivePromos } from "@/lib/content/promos";
import { getSitemapTimestamps } from "@/lib/content/seo";
import { PUBLIC_STATIC_ROUTES } from "@/lib/domain/seo";
import { getSiteUrl } from "@/lib/site-url";
import { dynamicSitemapEntries } from "./sitemap-entries";

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

  return [
    ...entries,
    ...dynamicSitemapEntries(url, { catalog, posts, eventSlugs, promos, pages, stamps }),
  ];
}