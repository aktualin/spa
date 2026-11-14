import { PUBLIC_STATIC_ROUTES } from "@/lib/domain/seo";

import type { OverviewSources } from "./seo.overview-fetch";
import type { OverviewRowBuilder, SeoOverviewGroup } from "./seo.overview.types";

/** Grup halaman tetap + katalog treatment (kategori, treatment, package). */
export function buildCatalogGroups(
  { categories, treatments, packages, story }: OverviewSources,
  row: OverviewRowBuilder,
): SeoOverviewGroup[] {
  return [
    {
      key: "static",
      label: "Halaman tetap",
      rows: PUBLIC_STATIC_ROUTES.map((route) =>
        row({
          path: route.path,
          label: route.label,
          isPublic: true,
          contentSeo:
            route.path === "/our-story"
              ? { title: story?.seoTitle ?? null, description: story?.seoDescription ?? null }
              : null,
          fallbackTitle: null,
          fallbackDescription: null,
          contentEditor: route.contentEditor ?? null,
        }),
      ),
    },
    {
      key: "categories",
      label: "Kategori treatment",
      rows: categories.map((c) =>
        row({
          path: `/treatments/${c.slug}`,
          label: c.name,
          isPublic: c.isPublished,
          contentSeo: { title: c.seoTitle, description: c.seoDescription },
          fallbackTitle: c.name,
          fallbackDescription: c.description,
          contentEditor: { label: "Editor kategori", href: `/admin/treatments/categories/${c.id}` },
        }),
      ),
    },
    {
      key: "treatments",
      label: "Treatment",
      rows: treatments.map((t) =>
        row({
          path: `/treatments/${t.category.slug}/${t.slug}`,
          label: t.name,
          isPublic: t.isPublished && t.category.isPublished,
          contentSeo: { title: t.seoTitle, description: t.seoDescription },
          fallbackTitle: t.name,
          fallbackDescription: t.description,
          contentEditor: { label: "Editor treatment", href: `/admin/treatments/${t.id}` },
        }),
      ),
    },
    {
      key: "packages",
      label: "Package",
      rows: packages.map((p) =>
        row({
          path: `/treatments/packages/${p.slug}`,
          label: p.name,
          isPublic: p.isPublished,
          contentSeo: { title: p.seoTitle, description: p.seoDescription },
          fallbackTitle: p.name,
          fallbackDescription: p.description,
          contentEditor: { label: "Editor package", href: `/admin/treatments/packages/${p.id}` },
        }),
      ),
    },
  ];
}