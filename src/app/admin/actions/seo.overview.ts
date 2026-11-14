"use server";

import { requireSession } from "@/lib/auth";
import { normalizeSeoPath } from "@/lib/domain/seo";

import { buildContentGroups } from "./seo.overview-content-groups";
import { fetchOverviewSources } from "./seo.overview-fetch";
import { buildCatalogGroups } from "./seo.overview-groups";
import type { SeoOverviewGroup, SeoOverviewRow } from "./seo.overview.types";

/**
 * Semua halaman publik — tetap + dinamis dari DB — beserta sumber metanya.
 * Konten yang punya field SEO sendiri ditautkan ke editornya (tidak
 * diduplikasi di sini).
 */
export async function getSeoOverview(): Promise<{
  groups: SeoOverviewGroup[];
  orphans: SeoOverviewRow[];
}> {
  await requireSession();

  const sources = await fetchOverviewSources();
  const { entries } = sources;

  const byPath = new Map(entries.map((entry) => [entry.path, entry]));
  const used = new Set<string>();
  const now = new Date();

  const row = (
    input: Omit<SeoOverviewRow, "pageSeo" | "key"> & { key?: string },
  ): SeoOverviewRow => {
    const path = normalizeSeoPath(input.path);
    const entry = byPath.get(path);
    if (entry) used.add(path);
    return {
      ...input,
      key: input.key ?? path,
      path,
      pageSeo: entry
        ? { id: entry.id, title: entry.title, description: entry.description, ogImageUrl: entry.ogImageUrl }
        : null,
    };
  };

  const groups: SeoOverviewGroup[] = [
    ...buildCatalogGroups(sources, row),
    ...buildContentGroups(sources, row, now),
  ];

  // Entri PageSeo yang path-nya tidak cocok dengan halaman mana pun di atas
  // (mis. /menu/<slug>, atau halaman yang slug-nya sudah berubah).
  const orphans: SeoOverviewRow[] = entries
    .filter((entry) => !used.has(entry.path))
    .map((entry) =>
      row({
        path: entry.path,
        label: entry.path,
        isPublic: true,
        contentSeo: null,
        fallbackTitle: null,
        fallbackDescription: null,
        contentEditor: null,
      }),
    );

  return { groups, orphans };
}