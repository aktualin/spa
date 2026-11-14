/** Field skema cabang: kontak, peta, koordinat, urutan. */
import { z } from "zod";

import { coordinate } from "./branch.schema-helpers.ts";
import { parseMapsEmbedInput } from "./site-settings.maps.ts";
import { isValidPhone, normalizeWhatsAppNumber } from "./site-settings.phone.ts";
import { isBlank } from "./text.ts";

export const branchContactFields = {
  whatsappNumber: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || normalizeWhatsAppNumber(value) !== null,
      "Nomor WhatsApp tidak valid. Tulis 08xx atau +62xx (8–15 digit, hanya angka).",
    )
    .transform((value) => (value ? normalizeWhatsAppNumber(value) : null)),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || isValidPhone(value),
      "Nomor telepon tidak valid (8–15 digit; boleh +, spasi, atau tanda hubung).",
    )
    .transform((value) => (value ? value : null)),
  email: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || z.email().safeParse(value).success,
      "Format email tidak valid.",
    )
    .transform((value) => (value ? value.toLowerCase() : null)),
  mapsEmbedUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || parseMapsEmbedInput(value) !== null,
      "URL embed Google Maps harus diawali https://www.google.com/maps/embed? — atau tempel kode <iframe> dari Google Maps.",
    )
    .transform((value) => (value ? parseMapsEmbedInput(value) : null)),
  mapsUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => isBlank(value ?? "") || /^https:\/\//.test(value ?? ""),
      "Tautan rute harus diawali https://",
    )
    .transform((value) => (value ? value : null)),
  latitude: coordinate("Lintang", 90),
  longitude: coordinate("Bujur", 180),
  // Kosong → cabang baru diletakkan di akhir daftar.
  sortOrder: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^\d+$/.test(value),
      "Urutan harus bilangan bulat 0 atau lebih.",
    )
    .transform((value) => (value ? Number(value) : null)),
  isPublished: z.boolean(),
};