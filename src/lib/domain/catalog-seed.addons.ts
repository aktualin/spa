/** Pemetaan kategori add-on ke section /menu — lihat `catalog-seed.ts`. */
import type { AdditionalService } from "../../data/content.ts";
import type { AddonSectionValue } from "./catalog-seed.types.ts";

export const ADDON_SECTION_BY_CATEGORY: Record<AdditionalService["category"], AddonSectionValue> = {
  Body: "BODY",
  Face: "FACE",
  "Head & Scalp": "HEAD_SCALP",
  Bath: "BATH",
};

/** Durasi add-on; konten statis lama tidak mencantumkannya. */
export const ADDON_DURATIONS: Record<string, number> = {
  "Face Ritual": 30,
  "Head & Scalp Treatment": 15,
  "Bath Ritual": 15,
  "Body Scrub": 15,
  "Body Mask": 15,
};