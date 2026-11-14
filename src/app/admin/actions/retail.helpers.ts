import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { CONTENT_TAGS } from "@/lib/content/tags";
import { RETAIL_LIMITS } from "@/lib/domain/retail";
import { richTextInput, richTextLength } from "@/lib/domain/rich-text";

import { optionalImageUrl, slugSchema, text } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

export const retailSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama produk wajib diisi.")
    .max(RETAIL_LIMITS.name, `Nama produk maksimal ${RETAIL_LIMITS.name} karakter.`),
  slug: slugSchema,
  description: z
    .string()
    .trim()
    .optional()
    // Batas dihitung dari teks terlihat, bukan markup HTML editor.
    .refine(
      (value) => !value || richTextLength(value) <= RETAIL_LIMITS.description,
      `Deskripsi maksimal ${RETAIL_LIMITS.description} karakter.`,
    ),
  // Hanya URL yang disimpan; file-nya ada di Supabase Storage/Media Library.
  imageUrl: optionalImageUrl,
  // Harga opsional: kosong berarti "Hubungi kami" (tanya via WhatsApp).
  priceIdr: z.string().trim().optional(),
  whatsappMessage: z
    .string()
    .trim()
    .max(
      RETAIL_LIMITS.whatsappMessage,
      `Pesan WhatsApp maksimal ${RETAIL_LIMITS.whatsappMessage} karakter.`,
    )
    .optional(),
  // Kosong → produk baru diletakkan di akhir daftar.
  sortOrder: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^\d+$/.test(value),
      "Urutan harus bilangan bulat 0 atau lebih.",
    )
    .transform((value) => (value ? Number(value) : null)),
  isHighlight: z.boolean(),
  isPublished: z.boolean(),
});

export function readForm(formData: FormData) {
  return {
    name: text(formData, "name") ?? "",
    slug: text(formData, "slug") ?? "",
    description: richTextInput(formData.get("description")),
    imageUrl: text(formData, "imageUrl"),
    priceIdr: text(formData, "priceIdr"),
    whatsappMessage: text(formData, "whatsappMessage"),
    sortOrder: text(formData, "sortOrder"),
    isHighlight: formData.get("isHighlight") === "on",
    isPublished: formData.get("isPublished") === "on",
  };
}

export function revalidateRetail() {
  updateTag(CONTENT_TAGS.retail);
  revalidatePath("/admin/retail");
  revalidatePath("/retail");
}