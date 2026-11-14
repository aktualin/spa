/**
 * Menerjemahkan katalog (database) ke bentuk data yang sudah dibaca halaman
 * /menu (`Treatment`, `Package`, `AdditionalService` di src/data/content.ts),
 * supaya markup halaman tidak berubah. Item baru dari admin ikut tampil, item
 * yang disembunyikan ikut hilang.
 */

import type {
  AdditionalService,
  Package as MenuPackage,
  Treatment as MenuTreatment,
} from "../../data/content.ts";
import {
  ADDON_SECTION_META,
  type MenuCatalogCategory,
  type MenuCatalogPackage,
} from "./menu-catalog.types.ts";
import { formatPriceLabel } from "./pricing.ts";

export type {
  MenuCatalogTreatment,
  MenuCatalogCategory,
  MenuCatalogPackage,
} from "./menu-catalog.types.ts";
export { ADDON_SECTION_LABEL } from "./menu-catalog.types.ts";

export function toMenuTreatments(categories: MenuCatalogCategory[]): MenuTreatment[] {
  return categories
    .filter((c) => c.kind === "TREATMENT")
    .flatMap((c) => c.treatments)
    .filter((t) => t.options.length > 0)
    .map((t) => ({
      kind: "treatment",
      slug: t.slug,
      name: t.name,
      // Seluruh treatment utama tampil di grid "Massage" halaman /menu.
      category: "Massage",
      ...(t.tagline ? { tagline: t.tagline } : {}),
      description: t.description ?? "",
      ...(t.note ? { note: t.note } : {}),
      prices: t.options.map((o) => ({ duration: o.label, price: formatPriceLabel(o.priceIdr) })),
      image: t.imageUrl ?? "",
    }));
}

export function toMenuPackages(packages: MenuCatalogPackage[]): MenuPackage[] {
  return packages.map((p) => ({
    kind: "package",
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle ?? "",
    quote: p.quote ?? "",
    description: p.description ?? "",
    includes: p.items.map((i) => ({ label: i.name, minutes: i.minutes ?? 0 })),
    duration: p.durationLabel ?? (p.durationMin ? `${p.durationMin} min` : ""),
    price: formatPriceLabel(p.priceIdr),
    image: p.imageUrl ?? "",
  }));
}

export function toMenuAddons(categories: MenuCatalogCategory[]): AdditionalService[] {
  return categories
    .filter((c) => c.kind === "ADDON")
    .flatMap((c) => c.treatments)
    .filter((t) => t.addonSection !== null && t.options.length > 0)
    .map((t) => ({
      name: t.name,
      category: ADDON_SECTION_META[t.addonSection!].category,
      anchor: ADDON_SECTION_META[t.addonSection!].anchor,
      price: formatPriceLabel(t.options[0].priceIdr),
      description: t.description ?? "",
      image: t.imageUrl ?? "",
    }));
}