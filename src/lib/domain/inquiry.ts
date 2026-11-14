/**
 * Logika murni endpoint Corporate Inquiry.
 *
 * Semua keputusan di sini (validasi input, ambil IP, honeypot, cek waktu isi
 * form) sengaja dipisah dari route handler supaya bisa diuji unit tanpa
 * database, tanpa HTTP, dan tanpa environment variable.
 *
 * Skema & validasi payload ada di `inquiry.schema.ts`; berkas ini
 * mengekspor ulangnya plus aturan anti-bot.
 */

export {
  INQUIRY_LIMITS,
  MIN_FORM_FILL_MS,
  inquirySchema,
  type InquiryInput,
  type InquiryValidation,
  validateInquiry,
} from "./inquiry.schema.ts";

import { MIN_FORM_FILL_MS } from "./inquiry.schema.ts";

/**
 * Ambil IP pengunjung dari header proxy.
 * `x-forwarded-for` bisa berisi daftar IP; yang pertama adalah peminta asli.
 */
export function extractClientIp(
  headers: { get(name: string): string | null },
): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

/**
 * Honeypot: field `website` harus kosong. Bot biasa mengisinya.
 * Kalau terisi, permintaan dianggap bot — jawab 200 tanpa menyimpan apa pun.
 */
export function isHoneypotFilled(website: unknown): boolean {
  return typeof website === "string" && website.trim() !== "";
}

/**
 * Cek waktu pengisian form. `startedAt` diisi browser saat form dirender;
 * submit sebelum 3 detik berarti bot.
 */
export function isFilledTooFast(
  startedAt: unknown,
  now: number = Date.now(),
  minMs: number = MIN_FORM_FILL_MS,
): boolean {
  if (typeof startedAt !== "number" || !Number.isFinite(startedAt)) return false;
  return now - startedAt < minMs;
}

/** Konversi error dari Turnstile menjadi pesan yang aman ditampilkan. */
export function describeTurnstileError(errors: unknown): string {
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0] as { code?: string } | undefined;
    if (first?.code === "invalid-input-response") {
      return "Verifikasi captcha gagal. Silakan coba lagi.";
    }
    if (first?.code === "timeout-or-duplicate") {
      return "Verifikasi captcha kedaluwarsa. Silakan muat ulang halaman.";
    }
  }
  return "Verifikasi captcha gagal. Silakan coba lagi.";
}