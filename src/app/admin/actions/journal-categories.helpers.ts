import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { CONTENT_TAGS } from "@/lib/content/tags";
import { JOURNAL_CATEGORY_MAX } from "@/lib/domain/journal";

export type ActionState = { error: string | null };

export const LIST_PATH = "/admin/journal/categories";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi.")
    .max(JOURNAL_CATEGORY_MAX, `Nama maksimal ${JOURNAL_CATEGORY_MAX} karakter.`),
  slug: z
    .string()
    .trim()
    .max(80, "Slug maksimal 80 karakter.")
    .optional(),
  sortOrder: z.coerce.number().int().min(0, "Urutan tidak boleh negatif.").default(0),
  isPublished: z.boolean(),
});

/**
 * Kategori ikut menentukan chip filter di /our-story/journal dan label di
 * kartu artikel, jadi daftar artikel publik ikut disegarkan.
 */
export function revalidateJournalCategories() {
  updateTag(CONTENT_TAGS.journal);
  revalidatePath(LIST_PATH);
  revalidatePath("/admin/journal");
  revalidatePath("/our-story/journal");
}