/**
 * Aturan SEO murni (tanpa I/O) — dipakai metadata publik, sitemap, robots,
 * dan dashboard `/admin/seo`. Diuji di `tests/unit/seo.test.mts`.
 * Implementasinya dipecah ke berkas `seo.*.ts` di folder ini; berkas ini
 * hanya mengekspor ulang simbol publiknya.
 */

export {
  SITE_NAME,
  TITLE_SEPARATOR,
  TITLE_TEMPLATE,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_DESCRIPTION,
  OG_LOCALE,
  SEO_LIMITS,
} from "./seo.constants.ts";
export { pageTitle, formatPageTitle, titleText } from "./seo.title.ts";
export {
  type SeoTextStatus,
  type SeoTextAssessment,
  assessSeoText,
} from "./seo.assess.ts";
export { normalizeSeoPath, seoPathError, isSeoFriendlyPath } from "./seo.path.ts";
export { type GscParseResult, parseGscVerification } from "./seo.gsc.ts";
export {
  type SeoOverride,
  type SeoSiteDefaults,
  mergePageSeo,
  faviconIcons,
} from "./seo.metadata.ts";
export { indexingDisabled, buildRobots, latestDate } from "./seo.robots.ts";
export {
  type SitemapStampKey,
  type PublicStaticRoute,
  PUBLIC_STATIC_ROUTES,
} from "./seo.routes.ts";