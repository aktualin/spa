/** Tipe isi awal katalog — lihat `catalog-seed.ts`. */

export type CategoryKindValue = "TREATMENT" | "ADDON";
export type AddonSectionValue = "BODY" | "FACE" | "HEAD_SCALP" | "BATH";

export type SeedCategory = {
  slug: string;
  name: string;
  kind: CategoryKindValue;
  sortOrder: number;
};

export type SeedOption = { label: string; durationMin: number; priceIdr: number };

export type SeedTreatment = {
  slug: string;
  name: string;
  categorySlug: string;
  tagline: string | null;
  description: string | null;
  note: string | null;
  imageUrl: string | null;
  addonSection: AddonSectionValue | null;
  sortOrder: number;
  options: SeedOption[];
};

export type SeedPackage = {
  slug: string;
  name: string;
  subtitle: string | null;
  quote: string | null;
  description: string | null;
  imageUrl: string | null;
  durationLabel: string | null;
  durationMin: number | null;
  priceIdr: number;
  sortOrder: number;
  items: { name: string; minutes: number | null }[];
};

export type CatalogSeed = {
  categories: SeedCategory[];
  treatments: SeedTreatment[];
  packages: SeedPackage[];
};

export const SEED_CATEGORIES: SeedCategory[] = [
  { slug: "reflexology", name: "Reflexology", kind: "TREATMENT", sortOrder: 0 },
  { slug: "body-massage", name: "Body Massage", kind: "TREATMENT", sortOrder: 1 },
  { slug: "add-ons", name: "Add-ons", kind: "ADDON", sortOrder: 2 },
];