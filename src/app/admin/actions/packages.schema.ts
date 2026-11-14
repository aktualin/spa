import { z } from "zod";

import { SLUG_PATTERN } from "@/lib/domain/slug";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null));

export const packageSchema = z.object({
  name: z.string().trim().min(1, "Nama package wajib diisi."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .regex(SLUG_PATTERN, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  subtitle: optionalText,
  quote: optionalText,
  description: optionalText,
  // Hanya URL yang disimpan; file-nya ada di Supabase Storage.
  imageUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  priceIdr: z.string().trim(),
  durationMin: z.string().trim(),
  durationLabel: optionalText,
  sortOrder: z.coerce.number().int().min(0).default(0),
  isNew: z.boolean(),
  isBestSeller: z.boolean(),
  isPublished: z.boolean(),
  seoTitle: optionalText,
  seoDescription: optionalText,
  whatsappMessage: optionalText,
});