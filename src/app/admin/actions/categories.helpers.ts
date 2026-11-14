import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { CONTENT_TAGS } from "@/lib/content/tags";
import { richTextLength } from "@/lib/domain/rich-text";
import { SLUG_PATTERN } from "@/lib/domain/slug";

import { revalidateRedirects } from "./redirects.helpers";

export type ActionState = { error: string | null };

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Nama kategori wajib diisi.").max(80),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .max(80, "Slug maksimal 80 karakter.")
    .regex(SLUG_PATTERN, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  kind: z.enum(["TREATMENT", "ADDON"]),
  description: z
    .string()
    .trim()
    .optional()
    // Batas dihitung dari teks terlihat, bukan markup HTML editor.
    .refine((value) => !value || richTextLength(value) <= 2000, "Deskripsi maksimal 2000 karakter."),
  imageUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  sortOrder: z.coerce.number().int().min(0, "Urutan tidak boleh negatif.").default(0),
  isPublished: z.boolean(),
  seoTitle: z.string().trim().max(70, "Meta title maksimal 70 karakter.").optional(),
  seoDescription: z.string().trim().max(200, "Meta description maksimal 200 karakter.").optional(),
});

export function revalidateCategories(redirectsChanged: boolean) {
  updateTag(CONTENT_TAGS.catalog);
  if (redirectsChanged) revalidateRedirects();
  revalidatePath("/admin/treatments");
  revalidatePath("/admin/treatments/addons");
  revalidatePath("/admin/treatments/categories");
  revalidatePath("/menu");
  revalidatePath("/treatments");
  revalidatePath("/sitemap.xml");
}