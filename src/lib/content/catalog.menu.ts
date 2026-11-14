/** Bacaan katalog untuk halaman /menu (desain asli situs). */
import { cacheLife, cacheTag } from "next/cache";

import type {
  AdditionalService,
  Package as StaticPackage,
  Treatment as StaticTreatment,
} from "@/data/content";
import { toMenuAddons, toMenuPackages, toMenuTreatments } from "@/lib/domain/menu-catalog";
import { formatPriceLabel } from "@/lib/domain/pricing";

import { getCatalog } from "./catalog.categories";
import { getPackages } from "./catalog.packages";
import { CONTENT_TAGS } from "./tags";

/** 145000 → "145k" — format harga yang dipakai desain halaman /menu. */
export const toPriceLabel = formatPriceLabel;

/** Treatment untuk grid /menu, dalam bentuk data statis lama (markup tidak berubah). */
export async function getMenuTreatments(): Promise<StaticTreatment[]> {
  return toMenuTreatments(await getCatalog());
}

/** Ritual All Day Spa untuk /menu, dari tabel Package. */
export async function getMenuPackages(): Promise<StaticPackage[]> {
  return toMenuPackages(await getPackages());
}

/** Add-on untuk section Body/Face/Head & Scalp/Bath di /menu. */
export async function getMenuAddons(): Promise<AdditionalService[]> {
  return toMenuAddons(await getCatalog());
}

/** Semua entri /menu (treatment + package). Dipakai `/menu` dan `/menu/[slug]`. */
export async function getMenuEntries(): Promise<(StaticTreatment | StaticPackage)[]> {
  const [treatments, packages] = await Promise.all([
    getMenuTreatments(),
    getMenuPackages(),
  ]);
  return [...treatments, ...packages];
}

/**
 * Versi cached panjang dari `getMenuEntries`.
 *
 * Dipakai di `generateMetadata` supaya judul halaman tetap ikut bisa
 * di-prerender (umur cache eksplisit mencegah cache pendek di dalamnya
 * menjadi "dynamic hole").
 */
export async function getMenuEntriesCached(): Promise<
  (StaticTreatment | StaticPackage)[]
> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);
  cacheLife("hours");
  return getMenuEntries();
}

/** Versi cached dari `getMenuAddons` untuk section add-on /menu. */
export async function getMenuAddonsCached(): Promise<AdditionalService[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);
  cacheLife("hours");
  return getMenuAddons();
}