/**
 * Bacaan SEO publik: override per halaman (`PageSeo`), pengaturan SEO global
 * (3 kolom `SiteSettings`: favicon, OG bawaan, verifikasi GSC), dan stempel
 * waktu untuk sitemap.
 *
 * Semua fungsi memakai `"use cache"` sehingga aman dipanggil dari
 * `generateMetadata` (termasuk root layout) tanpa membuat halaman dinamis.
 * DB kosong/down → nilai kosong, sehingga metadata bawaan yang dipakai.
 * Implementasinya dipecah ke berkas `seo.*.ts` di folder ini; berkas ini
 * hanya mengekspor ulang simbol publiknya.
 */

export type { PageSeoOverride, SeoSettings } from "./seo.types";
export { getPageSeo, getSeoSettings, withPageSeo } from "./seo.queries";
export { type SitemapTimestamps, getSitemapTimestamps } from "./seo.sitemap";