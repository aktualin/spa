import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { CONTENT_TAGS } from "@/lib/content/tags";

import { optionalImageUrl, optionalText, slugSchema, sortOrderSchema } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

export const promoSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Judul promo wajib diisi."),
  description: optionalText,
  bannerUrl: optionalImageUrl,
  terms: optionalText,
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  isPublished: z.boolean(),
  sortOrder: sortOrderSchema,
  seoTitle: optionalText,
  seoDescription: optionalText,
  whatsappMessage: optionalText,
});

export const promoPath = (slug: string) => `/promos/${slug}`;

export function revalidatePromo(slug?: string | null) {
  updateTag(CONTENT_TAGS.promos);
  // Promo bisa jadi blok highlight di homepage.
  updateTag(CONTENT_TAGS.homepage);
  revalidatePath("/admin/promos");
  revalidatePath("/promos");
  revalidatePath("/");
  if (slug) revalidatePath(`/promos/${slug}`);
}