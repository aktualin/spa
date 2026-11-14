export type SeoOverviewRow = {
  key: string;
  path: string;
  label: string;
  /** false = draf/tidak tayang (tidak masuk sitemap). */
  isPublic: boolean;
  /** Field SEO milik konten (seoTitle/seoDescription), bila ada. */
  contentSeo: { title: string | null; description: string | null } | null;
  /** Nilai cadangan bila SEO konten kosong (nama/ringkasan). */
  fallbackTitle: string | null;
  fallbackDescription: string | null;
  contentEditor: { label: string; href: string } | null;
  pageSeo: { id: string; title: string | null; description: string | null; ogImageUrl: string | null } | null;
};

export type SeoOverviewGroup = { key: string; label: string; rows: SeoOverviewRow[] };

/** Pembangun baris overview: menempelkan entri PageSeo yang cocok dengan path. */
export type OverviewRowBuilder = (
  input: Omit<SeoOverviewRow, "pageSeo" | "key"> & { key?: string },
) => SeoOverviewRow;