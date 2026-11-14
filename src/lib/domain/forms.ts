/**
 * Aturan murni formulir publik newsletter & reservasi (tanpa I/O).
 * Dipakai bersama oleh komponen form (client) dan route API (server)
 * supaya validasi tidak duplikat. Pertahanan bot (honeypot, lama pengisian)
 * mengikuti pola formulir inquiry corporate.
 */
import { z } from "zod";

import { isValidPhone } from "./site-settings.ts";

/** Pilihan lokasi untuk form; diisi halaman server dari modul Cabang. */
export type BranchOption = { slug: string; name: string; area: string };

export type NewsletterCopy = {
  title: string;
  description: string;
  emailLabel: string;
  nameLabel: string;
  branchLabel: string;
  submitLabel: string;
  success: string;
  error: string;
};

export type ReservationCopy = {
  title: string;
  description: string;
  nameLabel: string;
  phoneLabel: string;
  emailLabel: string;
  branchLabel: string;
  messageLabel: string;
  submitLabel: string;
  success: string;
  error: string;
};

export type FormResult<T> = { ok: true; data: T } | { ok: false; error: string };

const honeypot = z
  .string()
  .max(0, "Terjadi kesalahan. Coba lagi.");
const elapsed = z.number().int().min(0).max(86_400_000);

const newsletterSchema = z.object({
  email: z.string().trim().pipe(z.email("Format email tidak valid.")),
  name: z.string().trim().max(120, "Nama maks. 120 karakter.").optional(),
  branchSlug: z.string().trim().max(60).optional(),
  website: honeypot,
  elapsedMs: elapsed,
});

const reservationSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(120, "Nama maks. 120 karakter."),
  phone: z
    .string()
    .trim()
    .refine((value) => isValidPhone(value), "Nomor telepon tidak valid (8–15 digit)."),
  email: z
    .string()
    .trim()
    .refine((value) => !value || z.email().safeParse(value).success, "Format email tidak valid.")
    .optional(),
  branchSlug: z.string().trim().max(60).optional(),
  message: z.string().trim().max(1000, "Pesan maks. 1000 karakter.").optional(),
  website: honeypot,
  elapsedMs: elapsed,
});

export type NewsletterPayload = z.output<typeof newsletterSchema>;
export type ReservationPayload = z.output<typeof reservationSchema>;

/** Bot mengisi honeypot / mengirim terlalu cepat → sukses palsu di route. */
export function isBotSubmission(payload: { website?: string; elapsedMs: number }): boolean {
  return Boolean(payload.website) || payload.elapsedMs < 3000;
}

export function validateNewsletter(raw: unknown): FormResult<NewsletterPayload> {
  const parsed = newsletterSchema.safeParse(raw);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, error: parsed.error.issues[0]?.message ?? "Isian tidak valid." };
}

export function validateReservation(raw: unknown): FormResult<ReservationPayload> {
  const parsed = reservationSchema.safeParse(raw);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, error: parsed.error.issues[0]?.message ?? "Isian tidak valid." };
}
