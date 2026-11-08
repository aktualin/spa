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
import type { AddonSectionValue, CategoryKindValue } from "./catalog-seed.ts";
import { formatPriceLabel } from "./pricing.ts";

export type MenuCatalogTreatment = {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  note: string | null;
  imageUrl: string | null;
  addonSection: AddonSectionValue | null;
  options: { label: string; priceIdr: number }[];
};

export type MenuCatalogCategory = {
  kind: CategoryKindValue;
  treatments: MenuCatalogTreatment[];
};

export type MenuCatalogPackage = {
  slug: string;
  name: string;
  subtitle: string | null;
  quote: string | null;
  description: string | null;
  imageUrl: string | null;
  durationLabel: string | null;
  durationMin: number | null;
  priceIdr: number;
  items: { name: string; minutes: number | null }[];
};

const ADDON_SECTION_META: Record<
  AddonSectionValue,
  { category: AdditionalService["category"]; anchor: string }
> = {
  BODY: { category: "Body", anchor: "body" },
  FACE: { category: "Face", anchor: "face" },
  HEAD_SCALP: { category: "Head & Scalp", anchor: "head" },
  BATH: { category: "Bath", anchor: "bath" },
};

export const ADDON_SECTION_LABEL: Record<AddonSectionValue, string> = {
  BODY: "Body (grid scrub & mask)",
  FACE: "Face Ritual",
  HEAD_SCALP: "Head & Scalp",
  BATH: "Bath Ritual",
};

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
