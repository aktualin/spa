import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { CONTENT_TAGS } from "@/lib/content/tags";

import { optionalText, slugSchema, sortOrderSchema } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

export const tierSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1, "Nama tier wajib diisi."),
  priceLabel: z.string().trim().min(1, "Label harga wajib diisi."),
  billingNote: optionalText,
  summary: optionalText,
  benefits: z.array(z.string().trim().min(1)).max(20, "Maksimal 20 benefit per tier."),
  terms: optionalText,
  isPublished: z.boolean(),
  sortOrder: sortOrderSchema,
});

/** Form mengirim benefit sebagai benefits[0], benefits[1], dst. */
export function parseBenefits(formData: FormData): string[] {
  return formData
    .getAll("benefits")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
}

export function revalidateMembership(slug?: string | null) {
  updateTag(CONTENT_TAGS.membership);
  revalidatePath("/admin/membership");
  revalidatePath("/membership");
  revalidatePath("/promos/membership");
  if (slug) revalidatePath(`/promos/membership/${slug}`);
}