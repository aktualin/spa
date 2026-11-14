/** Field skema cabang: identitas & jam operasional. */
import { z } from "zod";

import { BRANCH_LIMITS } from "./branch.limits.ts";
import {
  MAX_OPENING_HOURS,
  MAX_OPENING_HOURS_LENGTH,
  normalizeOpeningHours,
} from "./site-settings.normalize.ts";
import { SLUG_PATTERN } from "./slug.ts";

export const branchIdentityFields = {
  name: z
    .string()
    .trim()
    .min(1, "Nama cabang wajib diisi.")
    .max(BRANCH_LIMITS.name, `Nama cabang maksimal ${BRANCH_LIMITS.name} karakter.`),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .regex(SLUG_PATTERN, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  area: z
    .string()
    .trim()
    .min(1, "Area wajib diisi.")
    .max(BRANCH_LIMITS.area, `Area maksimal ${BRANCH_LIMITS.area} karakter.`),
  tag: z
    .string()
    .trim()
    .max(BRANCH_LIMITS.tag, `Label maksimal ${BRANCH_LIMITS.tag} karakter.`)
    .optional()
    .transform((value) => (value ? value : null)),
  address: z
    .string()
    .trim()
    .max(BRANCH_LIMITS.address, `Alamat maksimal ${BRANCH_LIMITS.address} karakter.`)
    .optional()
    .transform((value) => (value ? value : null)),
  openingHours: z
    .array(
      z
        .string()
        .max(
          MAX_OPENING_HOURS_LENGTH,
          `Satu baris jam operasional maks. ${MAX_OPENING_HOURS_LENGTH} karakter.`,
        ),
    )
    .transform(normalizeOpeningHours)
    .refine(
      (lines) => lines.length <= MAX_OPENING_HOURS,
      `Jam operasional maks. ${MAX_OPENING_HOURS} baris.`,
    ),
};