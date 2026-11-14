/**
 * Aturan URL halaman bebas (`StaticPage`, tampil di `/<slug>`) dan redirect.
 * Murni — tanpa Prisma/Next — supaya bisa dipakai admin, proxy, dan unit test.
 * Implementasinya dipecah ke berkas `page-url.*.ts` di folder ini; berkas ini
 * hanya mengekspor ulang simbol publiknya.
 */

export {
  MAX_PAGE_SLUG_LENGTH,
  RESERVED_ROOT_SEGMENTS,
  validatePageSlug,
  pagePath,
  buildPreviewUrl,
} from "./page-url.slug.ts";
export { normalizePath } from "./page-url.path.ts";
export { validateRedirectInput } from "./page-url.redirect-validate.ts";
export {
  type RedirectRule,
  createsRedirectLoop,
  type SlugRedirectPlan,
  planSlugRedirect,
  type RedirectTarget,
  resolveRedirect,
} from "./page-url.redirect.ts";