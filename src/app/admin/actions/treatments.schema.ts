import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const optionSchema = z.object({
  label: z.string().trim().min(1, "Label durasi wajib diisi."),
  durationMin: z.coerce
    .number()
    .int("Durasi harus bilangan bulat.")
    .positive("Durasi harus lebih dari 0 menit."),
  priceIdr: z.coerce
    .number()
    .int("Harga harus bilangan bulat rupiah.")
    .min(0, "Harga tidak boleh negatif."),
});

export const treatmentSchema = z.object({
  name: z.string().trim().min(1, "Nama treatment wajib diisi."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .regex(slugPattern, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  categoryId: z.string().trim().min(1, "Kategori wajib dipilih."),
  tagline: z.string().trim().max(160, "Tagline maksimal 160 karakter.").optional(),
  description: z.string().trim().optional(),
  note: z.string().trim().max(200, "Catatan maksimal 200 karakter.").optional(),
  addonSection: z.enum(["BODY", "FACE", "HEAD_SCALP", "BATH"]).optional(),
  // Hanya URL yang disimpan; file-nya ada di Supabase Storage.
  imageUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  whatsappMessage: z.string().trim().optional(),
  // Dipakai halaman /treatments/[kategori]/[slug]; kosong = pakai default.
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isNew: z.boolean(),
  isBestSeller: z.boolean(),
  isPublished: z.boolean(),
  options: z.array(optionSchema).min(1, "Minimal satu opsi durasi & harga."),
});