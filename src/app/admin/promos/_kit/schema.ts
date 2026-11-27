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
  return error.issues[0]?.message ?? "Invalid input.";
}

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .regex(SLUG_PATTERN, "Slug may only contain lowercase letters, numbers, and hyphens.");

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
    "Invalid image URL.",
  )
  .transform((value) => (value ? value : null));

export const requiredImageUrl = z
  .string()
  .trim()
  .min(1, "An image must be uploaded.")
  .refine(
    (value) => /^https:\/\/\S+$/.test(value),
    "Invalid image URL.",
  );

export const sortOrderSchema = z.coerce
  .number()
  .int("Order must be an integer.")
  .min(0, "Order must not be negative.")
  .default(0);

/** Nilai string dari FormData; null (field tidak ada) → undefined. */
export function text(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

export function checked(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}