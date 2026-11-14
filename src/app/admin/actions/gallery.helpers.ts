import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { CONTENT_TAGS } from "@/lib/content/tags";
import { isPhotoUrl } from "@/lib/domain/gallery";

import { optionalImageUrl, optionalText, slugSchema, sortOrderSchema } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

export const photoUrlSchema = z
  .string()
  .trim()
  .min(1, "Foto wajib diunggah.")
  .refine(isPhotoUrl, "URL foto tidak valid.");

export const albumSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1, "Nama album wajib diisi."),
  description: optionalText,
  coverUrl: optionalImageUrl,
  isPublished: z.boolean(),
  sortOrder: sortOrderSchema,
});

export const photoSchema = z.object({
  albumId: z.string().trim().min(1, "Album wajib diisi."),
  imageUrl: photoUrlSchema,
  caption: optionalText,
  altText: optionalText,
  sortOrder: z.coerce.number().int().min(0).default(0),
});

// Album tidak punya halaman sendiri — seluruhnya tampil di /gallery.
export function revalidateGallery() {
  updateTag(CONTENT_TAGS.gallery);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}