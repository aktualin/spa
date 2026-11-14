/** Tipe bacaan SEO publik — lihat `seo.ts`. */

export type PageSeoOverride = {
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
};

export type SeoSettings = {
  gscVerification: string | null;
  faviconUrl: string | null;
  defaultOgImageUrl: string | null;
  seoSiteName: string | null;
  seoDefaultTitle: string | null;
  seoDefaultDescription: string | null;
  seoOgDescription: string | null;
  seoOgLocale: string | null;
  seoTitleTemplate: string | null;
  seoKeywords: string[];
};

export const EMPTY_SETTINGS: SeoSettings = {
  gscVerification: null,
  faviconUrl: null,
  defaultOgImageUrl: null,
  seoSiteName: null,
  seoDefaultTitle: null,
  seoDefaultDescription: null,
  seoOgDescription: null,
  seoOgLocale: null,
  seoTitleTemplate: null,
  seoKeywords: [],
};