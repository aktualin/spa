/** Baris kategori + treatment dari database → bentuk publik. */
import type { AddonSectionValue, CategoryKindValue } from "@/lib/domain/catalog-seed";

import type { CatalogCategory } from "./catalog.types";

export const CATEGORY_INCLUDE = {
  treatments: {
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" as const }, { name: "asc" as const }],
    include: { options: { orderBy: { sortOrder: "asc" as const } } },
  },
};

export type CategoryRow = {
  slug: string;
  name: string;
  kind: CategoryKindValue;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  treatments: {
    slug: string;
    name: string;
    tagline: string | null;
    description: string | null;
    note: string | null;
    imageUrl: string | null;
    addonSection: AddonSectionValue | null;
    isNew: boolean;
    isBestSeller: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
    whatsappMessage: string | null;
    options: { label: string; durationMin: number; priceIdr: number }[];
  }[];
};

export function toCatalogCategory(c: CategoryRow): CatalogCategory {
  return {
    slug: c.slug,
    name: c.name,
    kind: c.kind,
    description: c.description,
    imageUrl: c.imageUrl,
    seoTitle: c.seoTitle,
    seoDescription: c.seoDescription,
    treatments: c.treatments.map((t) => ({
      slug: t.slug,
      name: t.name,
      tagline: t.tagline,
      description: t.description,
      note: t.note,
      imageUrl: t.imageUrl,
      addonSection: t.addonSection,
      isNew: t.isNew,
      isBestSeller: t.isBestSeller,
      categorySlug: c.slug,
      categoryName: c.name,
      options: t.options.map((o) => ({
        label: o.label,
        durationMin: o.durationMin,
        priceIdr: o.priceIdr,
      })),
      seoTitle: t.seoTitle,
      seoDescription: t.seoDescription,
      whatsappMessage: t.whatsappMessage,
    })),
  };
}