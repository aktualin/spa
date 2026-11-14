import { z } from "zod";

import { InvalidPriceError, parseOptionalPriceIdr } from "@/lib/domain/pricing";

export type ActionState = { error: string | null; ok?: boolean };

export const priceRowSchema = z.object({
  priceIdr: z.string().trim(),
  durationMin: z.string().trim(),
});

/** Jalankan parser harga; InvalidPriceError diubah menjadi pesan galat. */
export function tryParsePrice<T>(parse: () => T): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: parse() };
  } catch (error) {
    if (error instanceof InvalidPriceError) return { ok: false, error: error.message };
    throw error;
  }
}

/** Harga opsional dari form: kosong = null (harga tidak ditampilkan). */
export function parseOptionalPrice(formData: FormData) {
  return tryParsePrice(() => parseOptionalPriceIdr(String(formData.get("priceIdr") ?? "")));
}