/** Tipe terjemahan katalog ke data /menu — lihat `menu-catalog.ts`. */
import type { AdditionalService } from "../../data/content.ts";
import type { AddonSectionValue, CategoryKindValue } from "./catalog-seed.ts";

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

export const ADDON_SECTION_META: Record<
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