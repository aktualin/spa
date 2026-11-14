/**
 * Bacaan publik katalog: kategori, treatment, add-on, opsi harga, dan package.
 *
 * Pola yang dipakai seluruh `src/lib/content/*`:
 * 1. `"use cache"` + `cacheTag(CONTENT_TAGS.x)` — admin memanggil
 *    `updateTag(CONTENT_TAGS.x)` setelah menulis.
 * 2. Prisma di-import dinamis di dalam `safeQueryWithMeta`, jadi env yang
 *    belum diset / DB down tidak pernah membuat halaman crash.
 * 3. Tabel kosong atau DB tidak terjangkau → daftar kosong (halaman memberi
 *    empty state), dan `cacheLife("minutes")` supaya keadaan itu tidak
 *    tertahan lama di cache (profil `seconds` terlalu pendek: Next menolak
 *    mem-prerender halamannya).
 *
 * Implementasinya dipecah ke berkas `catalog.*.ts` di folder ini; berkas ini
 * hanya mengekspor ulang simbol publiknya.
 */

export type {
  CatalogOption,
  CatalogTreatment,
  CatalogCategory,
  CatalogPackageItem,
  CatalogPackage,
} from "./catalog.types";
export {
  getCatalog,
  getCategory,
  getTreatment,
  getSignatureTreatments,
  getAllTreatments,
  getTreatmentBySlug,
} from "./catalog.categories";
export { getPackages, getPackage, getCatalogSlugs } from "./catalog.packages";
export {
  toPriceLabel,
  getMenuTreatments,
  getMenuPackages,
  getMenuAddons,
  getMenuEntries,
  getMenuEntriesCached,
  getMenuAddonsCached,
} from "./catalog.menu";
export { getMenuEntry } from "./catalog.menu-entry";