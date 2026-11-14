/** Anti-spam formulir inquiry corporate — lihat `corporate.ts`. */
import { isEmail } from "./corporate.pic.ts";
import { cleanList } from "./corporate.validation.ts";

/** Waktu minimal (ms) sejak formulir tampil sampai dikirim. */
export const MIN_INQUIRY_FILL_MS = 3000;

/** Batas ukuran body permintaan inquiry (byte/karakter). */
export const MAX_INQUIRY_BODY = 20_000;

/**
 * Cek lama pengisian. `elapsedMs` dihitung browser dari jam browser sendiri
 * (bebas selisih jam server ↔ klien).
 * - "missing"  → tidak dikirim / bukan angka: bukan dari formulir kita (bot).
 * - "too-fast" → dikirim kurang dari batas minimum.
 */
export function checkFillTime(
  elapsedMs: unknown,
  minMs: number = MIN_INQUIRY_FILL_MS,
): "ok" | "missing" | "too-fast" {
  if (typeof elapsedMs !== "number" || !Number.isFinite(elapsedMs) || elapsedMs < 0) {
    return "missing";
  }
  return elapsedMs < minMs ? "too-fast" : "ok";
}

/**
 * Kebijakan captcha:
 * - secret ada → "verify" (token wajib & diverifikasi ke Turnstile);
 * - secret kosong di production → "unavailable" (fail-closed, kiriman ditolak);
 * - secret kosong di luar production → "skip" (development, dengan peringatan).
 */
export function resolveCaptchaPolicy(input: {
  secret: string | undefined | null;
  nodeEnv: string | undefined;
}): "verify" | "skip" | "unavailable" {
  if (input.secret && input.secret.trim()) return "verify";
  return input.nodeEnv === "production" ? "unavailable" : "skip";
}

/**
 * Penerima email notifikasi: `CORPORATE_INQUIRY_TO` (boleh beberapa alamat,
 * dipisah koma) → email PIC. Alamat tidak valid dibuang.
 */
export function resolveInquiryRecipients(input: {
  envTo: string | undefined | null;
  picEmail: string | undefined | null;
}): string[] {
  const fromEnv = cleanList((input.envTo ?? "").split(/[,;]/)).filter(isEmail);
  if (fromEnv.length > 0) return fromEnv;
  const pic = input.picEmail?.trim();
  return pic && isEmail(pic) ? [pic] : [];
}