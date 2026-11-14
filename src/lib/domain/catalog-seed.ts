/**
 * Isi katalog yang disusun dari konten statis lama (`src/data/content.ts`):
 * kategori, treatment, add-on, dan package. Dipakai seeder, migrasi data,
 * fallback saat database tidak terbaca, dan unit test kesetaraan /menu —
 * satu sumber supaya keempatnya tidak pernah berbeda.
 */

import type {
  AdditionalService,
  Package as StaticPackage,
  Treatment as StaticTreatment,
} from "../../data/content.ts";
import type { CatalogSeed, SeedPackage, SeedTreatment } from "./catalog-seed.types.ts";
import { SEED_CATEGORIES } from "./catalog-seed.types.ts";
import { ADDON_DURATIONS, ADDON_SECTION_BY_CATEGORY } from "./catalog-seed.addons.ts";
import { parseDurationLabel, parsePriceLabel } from "./pricing.ts";
import { slugify } from "./slug.ts";

export type {
  CategoryKindValue,
  AddonSectionValue,
  SeedCategory,
  SeedOption,
  SeedTreatment,
  SeedPackage,
  CatalogSeed,
} from "./catalog-seed.types.ts";
export { SEED_CATEGORIES } from "./catalog-seed.types.ts";
export { ADDON_SECTION_BY_CATEGORY } from "./catalog-seed.addons.ts";

const REFLEXOLOGY_SLUGS = new Set(["chair-reflexology", "chair-spa", "chair-body-recovery"]);

export function buildStaticCatalogSeed(source: {
  treatments: StaticTreatment[];
  packages: StaticPackage[];
  additionalServices: AdditionalService[];
}): CatalogSeed {
  const order = new Map<string, number>();
  const nextOrder = (categorySlug: string) => {
    const value = order.get(categorySlug) ?? 0;
    order.set(categorySlug, value + 1);
    return value;
  };

  const treatments: SeedTreatment[] = source.treatments.map((t) => {
    const categorySlug = REFLEXOLOGY_SLUGS.has(t.slug) ? "reflexology" : "body-massage";
    return {
      slug: t.slug,
      name: t.name,
      categorySlug,
      tagline: t.tagline ?? null,
      description: t.description,
      note: t.note ?? null,
      imageUrl: t.image,
      addonSection: null,
      sortOrder: nextOrder(categorySlug),
      options: t.prices.map((p) => ({
        label: p.duration,
        durationMin: parseDurationLabel(p.duration),
        priceIdr: parsePriceLabel(p.price),
      })),
    };
  });

  for (const service of source.additionalServices) {
    const minutes = ADDON_DURATIONS[service.name] ?? 15;
    treatments.push({
      slug: slugify(service.name),
      name: service.name,
      categorySlug: "add-ons",
      tagline: null,
      description: service.description,
      note: null,
      imageUrl: service.image,
      addonSection: ADDON_SECTION_BY_CATEGORY[service.category],
      sortOrder: nextOrder("add-ons"),
      options: [{ label: `${minutes} min`, durationMin: minutes, priceIdr: parsePriceLabel(service.price) }],
    });
  }

  const packages: SeedPackage[] = source.packages.map((p, index) => ({
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    quote: p.quote,
    description: p.description,
    imageUrl: p.image,
    durationLabel: p.duration,
    durationMin: parseDurationLabel(p.duration) || null,
    priceIdr: parsePriceLabel(p.price),
    sortOrder: index,
    items: p.includes.map((i) => ({ name: i.label, minutes: i.minutes })),
  }));

  return { categories: SEED_CATEGORIES, treatments, packages };
}