/** Validasi kontak PIC corporate — lihat `corporate.ts`. */
import { z } from "zod";

import type { CorporatePic } from "./corporate.types.ts";
import { CORPORATE_LIMITS, type Validation } from "./corporate.validation.ts";
import { isValidPhone } from "./site-settings.phone.ts";
import { collapseSpaces } from "./text.ts";

const emailSchema = z.string().email();

export function isEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}

/**
 * Nomor telepon PIC: hanya digit, spasi, "+", "-", ".", dan kurung; 8–15
 * digit. Nomor Indonesia (0…, 62…, +62…) dipakai juga untuk tautan WhatsApp.
 * Aturannya sama dengan `isValidPhone` Kontak & Umum.
 */
export function isPhone(value: string): boolean {
  return isValidPhone(value);
}

export function validatePicInput(input: {
  name: string;
  email: string;
  phone: string;
}): Validation<CorporatePic> {
  const name = collapseSpaces(input.name);
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();

  if (!name) return { ok: false, error: "Nama PIC wajib diisi." };
  if (name.length > CORPORATE_LIMITS.picName) {
    return { ok: false, error: `Nama PIC maksimal ${CORPORATE_LIMITS.picName} karakter.` };
  }
  if (!email) return { ok: false, error: "Email PIC wajib diisi." };
  if (!isEmail(email)) return { ok: false, error: "Format email PIC tidak valid." };
  if (!phone) return { ok: false, error: "Telepon PIC wajib diisi." };
  if (phone.length > CORPORATE_LIMITS.picPhone || !isPhone(phone)) {
    return {
      ok: false,
      error: "Nomor telepon PIC tidak valid. Gunakan 8–15 digit, mis. +62 813-1485-6565.",
    };
  }
  return { ok: true, data: { name, email, phone } };
}