/** Field skema Kontak & Umum: alamat, jam, WhatsApp, email, telepon. */
import { z } from "zod";

import { isBlank } from "./text.ts";
import {
  MAX_OPENING_HOURS,
  MAX_OPENING_HOURS_LENGTH,
  normalizeOpeningHours,
} from "./site-settings.normalize.ts";
import { isValidPhone, normalizeWhatsAppNumber } from "./site-settings.phone.ts";

export const contactFields = {
  address: z
    .string()
    .trim()
    .min(1, "Alamat wajib diisi.")
    .max(300, "Alamat terlalu panjang (maks. 300 karakter)."),
  openingHours: z
    .array(
      z
        .string()
        .max(
          MAX_OPENING_HOURS_LENGTH,
          `Satu baris jam operasional maks. ${MAX_OPENING_HOURS_LENGTH} karakter.`,
        ),
    )
    .transform(normalizeOpeningHours)
    .refine((lines) => lines.length > 0, "Isi minimal satu baris jam operasional.")
    .refine(
      (lines) => lines.length <= MAX_OPENING_HOURS,
      `Jam operasional maks. ${MAX_OPENING_HOURS} baris.`,
    ),
  whatsappNumber: z
    .string()
    .trim()
    .min(1, "Nomor WhatsApp wajib diisi.")
    .refine(
      (value) => normalizeWhatsAppNumber(value) !== null,
      "Nomor WhatsApp tidak valid. Tulis 08xx atau +62xx (8–15 digit, hanya angka).",
    )
    .transform((value) => normalizeWhatsAppNumber(value) as string),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .pipe(z.email("Format email tidak valid."))
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => isBlank(value) || isValidPhone(value),
      "Nomor telepon tidak valid (8–15 digit; boleh +, spasi, atau tanda hubung).",
    ),
};