/** Tipe bacaan publik katalog — lihat `catalog.ts`. */
import type { AddonSectionValue, CategoryKindValue } from "@/lib/domain/catalog-seed";

export type CatalogOption = {
  label: string;
  durationMin: number;
  priceIdr: number;
};

export type CatalogTreatment = {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  note: string | null;
  imageUrl: string | null;
  addonSection: AddonSectionValue | null;
  isNew: boolean;
  isBestSeller: boolean;
  categorySlug: string;
  categoryName: string;
  options: CatalogOption[];
  seoTitle: string | null;
  seoDescription: string | null;
  whatsappMessage: string | null;
};

export type CatalogCategory = {
  slug: string;
  name: string;
  kind: CategoryKindValue;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  treatments: CatalogTreatment[];
};

export type CatalogPackageItem = {
  /** Teks tampil, mis. "Body Massage (90 min)". */
  label: string;
  name: string;
  minutes: number | null;
  treatmentSlug: string | null;
};

export type CatalogPackage = {
  slug: string;
  name: string;
  subtitle: string | null;
  quote: string | null;
  description: string | null;
  imageUrl: string | null;
  durationMin: number | null;
  durationLabel: string | null;
  priceIdr: number;
  isNew: boolean;
  isBestSeller: boolean;
  items: CatalogPackageItem[];
  seoTitle: string | null;
  seoDescription: string | null;
  whatsappMessage: string | null;
};