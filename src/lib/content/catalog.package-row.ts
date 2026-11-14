/** Baris package dari database → bentuk publik. */
import type { CatalogPackage } from "./catalog.types";

export const PACKAGE_INCLUDE = {
  items: {
    orderBy: { sortOrder: "asc" as const },
    include: { treatment: { select: { slug: true, name: true } } },
  },
};

export type PackageRow = {
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
  seoTitle: string | null;
  seoDescription: string | null;
  whatsappMessage: string | null;
  items: {
    label: string | null;
    minutes: number | null;
    treatment: { slug: string; name: string } | null;
  }[];
};

function itemLabel(name: string, minutes: number | null): string {
  return minutes ? `${name} (${minutes} min)` : name;
}

export function toCatalogPackage(p: PackageRow): CatalogPackage {
  return {
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    quote: p.quote,
    description: p.description,
    imageUrl: p.imageUrl,
    durationMin: p.durationMin,
    durationLabel: p.durationLabel,
    priceIdr: p.priceIdr,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    items: p.items.map((i) => {
      const name = i.label ?? i.treatment?.name ?? "";
      return {
        label: itemLabel(name, i.minutes),
        name,
        minutes: i.minutes,
        treatmentSlug: i.treatment?.slug ?? null,
      };
    }),
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    whatsappMessage: p.whatsappMessage,
  };
}