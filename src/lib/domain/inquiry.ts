/**
 * Logika murni endpoint Corporate Inquiry.
 *
 * Semua keputusan di sini (validasi input, ambil IP, honeypot, cek waktu isi
 * form) sengaja dipisah dari route handler supaya bisa diuji unit tanpa
 * database, tanpa HTTP, dan tanpa environment variable.
 */

import { z } from "zod";

/** Batas panjang field — protects database dan tampilan dashboard admin. */
export const INQUIRY_LIMITS = {
  name: 120,
  company: 160,
  email: 254,
  phone: 40,
  message: 5000,
} as const;

/** Form harus diisi minimal selama ini (detik) sebelum boleh dikirim. */
export const MIN_FORM_FILL_MS = 3000;

/** Skema data yang sampai ke server. Semua field bebas dari HTML. */
export const inquirySchema = z.object({
  name: z
    .string({ error: "Nama wajib diisi." })
    .trim()
    .min(2, "Nama wajib diisi.")
    .max(INQUIRY_LIMITS.name, "Nama terlalu panjang."),
  company: z
    .string()
    .trim()
    .max(INQUIRY_LIMITS.company, "Nama perusahaan terlalu panjang.")
    .optional(),
  email: z
    .string({ error: "Email wajib diisi." })
    .trim()
    .min(1, "Email wajib diisi.")
    .max(INQUIRY_LIMITS.email, "Email terlalu panjang.")
    .email("Format email tidak valid."),
  phone: z
    .string()
    .trim()
    .max(INQUIRY_LIMITS.phone, "Nomor telepon terlalu panjang.")
    .optional(),
  message: z
    .string({ error: "Pesan wajib diisi." })
    .trim()
    .min(10, "Pesan terlalu singkat.")
    .max(INQUIRY_LIMITS.message, "Pesan terlalu panjang (maksimal 5000 karakter)."),
  captchaToken: z.string().trim().optional(),
  website: z.string().trim().optional(),
  startedAt: z.number().int().nonnegative().optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export type InquiryValidation =
  | { ok: true; data: InquiryInput }
  | { ok: false; error: string };

/**
 * Validasi payload inquiry. Mengembalikan pesan error berbahasa Indonesia
 * yang aman untuk ditampilkan ke pengunjung.
 */
export function validateInquiry(raw: unknown): InquiryValidation {
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? "Input tidak valid." };
  }

  // Field opsional yang kosong string diperlakukan sebagai tidak diisi.
  const data = parsed.data;
  return {
    ok: true,
    data: {
      ...data,
      company: data.company ? data.company : undefined,
      phone: data.phone ? data.phone : undefined,
      captchaToken: data.captchaToken ? data.captchaToken : undefined,
      website: data.website ? data.website : undefined,
    },
  };
}

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
