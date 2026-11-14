import type { SeoOverviewRow } from "../actions/seo";

export type Effective = {
  source: "page-seo" | "content" | "fallback" | "default";
  title: string | null;
  description: string | null;
};

/** Meta yang benar-benar dipakai: entri SEO → SEO konten → nama/ringkasan → bawaan halaman. */
export function effectiveMeta(row: SeoOverviewRow): Effective {
  const title =
    row.pageSeo?.title || row.contentSeo?.title || row.fallbackTitle || null;
  const description =
    row.pageSeo?.description ||
    row.contentSeo?.description ||
    row.fallbackDescription ||
    null;

  let source: Effective["source"] = "default";
  if (row.pageSeo?.title || row.pageSeo?.description) source = "page-seo";
  else if (row.contentSeo?.title || row.contentSeo?.description) source = "content";
  else if (row.fallbackTitle) source = "fallback";

  return { source, title, description };
}

export const SOURCE_LABEL: Record<Effective["source"], string> = {
  "page-seo": "Entri SEO",
  content: "SEO konten",
  fallback: "Dari nama/ringkasan",
  default: "Bawaan halaman",
};