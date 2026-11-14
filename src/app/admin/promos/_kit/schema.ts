import { z } from "zod";

import { SLUG_PATTERN } from "@/lib/domain/slug";

/**
 * Helper bersama modul admin Gallery, Promos, Gift Card, Membership, Journal,
 * dan Events. File ini murni (tanpa "use server"/"use client") supaya bisa
 * diimpor dari Server Action maupun halaman.
 *
 * Helper tanggal/WIB ada di ./wib dan diekspor ulang dari sini.
 */

export {
  SPA_TIME_ZONE,
  parseWibInput,
  toWibDateTimeInput,
  toWibDateInput,
  formatWibDate,
  formatWibDateTime,
} from "./wib";

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug wajib diisi.")
  .regex(SLUG_PATTERN, "Slug hanya boleh huruf kecil, angka, dan tanda hubung.");

/** Teks opsional: string kosong disimpan sebagai null. */
export const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null));

/**
 * URL gambar hasil ImageField: hanya https:// dari bucket S3 (Supabase
 * Storage); path lokal ditolak. Kosong → null.
 */
export const optionalImageUrl = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || /^https:\/\/\S+$/.test(value),
    "URL gambar tidak valid.",
  )
  .transform((value) => (value ? value : null));

export const requiredImageUrl = z
  .string()
  .trim()
  .min(1, "Gambar wajib diunggah.")
  .refine(
    (value) => /^https:\/\/\S+$/.test(value),
    "URL gambar tidak valid.",
  );

export const sortOrderSchema = z.coerce
  .number()
  .int("Urutan harus bilangan bulat.")
  .min(0, "Urutan tidak boleh negatif.")
  .default(0);

/** Nilai string dari FormData; null (field tidak ada) → undefined. */
export function text(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

export function checked(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}