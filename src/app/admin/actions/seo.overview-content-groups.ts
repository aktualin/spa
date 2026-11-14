import { journalPath } from "@/lib/domain/journal";

import type { OverviewSources } from "./seo.overview-fetch";
import type { OverviewRowBuilder, SeoOverviewGroup } from "./seo.overview.types";

/** Grup konten editorial: journal, event, promo, dan halaman statis. */
export function buildContentGroups(
  { posts, events, promos, pages }: OverviewSources,
  row: OverviewRowBuilder,
  now: Date,
): SeoOverviewGroup[] {
  return [
    {
      key: "journal",
      label: "Artikel journal",
      rows: posts.map((post) =>
        row({
          path: journalPath(post.slug),
          label: post.title,
          isPublic: post.status === "PUBLISHED" && !!post.publishedAt && post.publishedAt <= now,
          contentSeo: { title: post.seoTitle, description: post.seoDescription },
          fallbackTitle: post.title,
          fallbackDescription: post.excerpt,
          contentEditor: { label: "Editor artikel", href: `/admin/journal/${post.id}` },
        }),
      ),
    },
    {
      key: "events",
      label: "Event",
      rows: events.map((e) =>
        row({
          path: `/events/${e.slug}`,
          label: e.title,
          isPublic: e.isPublished,
          contentSeo: { title: e.seoTitle, description: e.seoDescription },
          fallbackTitle: e.title,
          fallbackDescription: e.description,
          contentEditor: { label: "Editor event", href: `/admin/events/${e.id}` },
        }),
      ),
    },
    {
      key: "promos",
      label: "Promo",
      rows: promos.map((p) =>
        row({
          path: `/promos/${p.slug}`,
          label: p.title,
          isPublic: p.isPublished && (!p.endDate || p.endDate >= now),
          contentSeo: { title: p.seoTitle, description: p.seoDescription },
          fallbackTitle: p.title,
          fallbackDescription: p.description,
          contentEditor: { label: "Editor promo", href: `/admin/promos/${p.id}` },
        }),
      ),
    },
    {
      key: "pages",
      label: "Halaman (Halaman & URL)",
      rows: pages.map((p) =>
        row({
          path: `/${p.slug}`,
          label: p.title,
          isPublic: p.status === "PUBLISHED",
          contentSeo: { title: p.seoTitle, description: p.seoDescription },
          fallbackTitle: p.title,
          fallbackDescription: null,
          contentEditor: { label: "Editor halaman", href: `/admin/pages/${p.id}` },
        }),
      ),
    },
  ];
}