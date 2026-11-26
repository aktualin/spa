/**
 * Aturan murni formulir publik reservasi (tanpa I/O).
 * Dipakai bersama oleh komponen form (client) dan route API (server)
 * supaya validasi tidak duplikat. Pertahanan bot (honeypot, lama pengisian)
 * mengikuti pola formulir inquiry corporate.
 */
import { z } from "zod";

import { isValidPhone } from "./site-settings.ts";

/** Pilihan lokasi untuk form; diisi halaman server dari modul Cabang. */
export type BranchOption = { slug: string; name: string; area: string };

/** Pilihan layanan untuk form, dikelompokkan (kategori treatment + paket). */
export type ReservationServiceGroup = { group: string; options: readonly string[] };

export type ReservationCopy = {
  title: string;
  description: string;
  nameLabel: string;
  phoneLabel: string;
  emailLabel: string;
  branchLabel: string;
  treatmentLabel: string;
  dateLabel: string;
  timeLabel: string;
  guestsLabel: string;
  messageLabel: string;
  submitLabel: string;
  success: string;
  error: string;
};

export type FormResult<T> = { ok: true; data: T } | { ok: false; error: string };

const honeypot = z
  .string()
  .max(0, "Something went wrong. Please try again.");
const elapsed = z.number().int().min(0).max(86_400_000);

/** Format <input type="date"> / <input type="time">; kosong = tidak diisi. */
const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const optionalFormatted = (pattern: RegExp, message: string) =>
  z
    .string()
    .trim()
    .refine((value) => !value || pattern.test(value), message)
    .optional();

const reservationSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120, "Name must be 120 characters or fewer."),
  phone: z
    .string()
    .trim()
    .refine((value) => isValidPhone(value), "Phone number is invalid (8–15 digits)."),
  email: z
    .string()
    .trim()
    .refine((value) => !value || z.email().safeParse(value).success, "Invalid email format.")
    .optional(),
  branchSlug: z.string().trim().max(60).optional(),
  treatment: z.string().trim().max(160, "Treatment name must be 160 characters or fewer.").optional(),
  preferredDate: optionalFormatted(DATE_PATTERN, "Invalid date format."),
  preferredTime: optionalFormatted(TIME_PATTERN, "Invalid time format."),
  guests: z.preprocess(
    (value) => (typeof value === "string" && !value.trim() ? undefined : value),
    z.coerce
      .number({ error: "Invalid number of guests." })
      .int()
      .min(1, "At least 1 guest is required.")
      .max(20, "For groups larger than 20, please contact us via WhatsApp.")
      .optional(),
  ),
  message: z.string().trim().max(1000, "Message must be 1000 characters or fewer.").optional(),
  website: honeypot,
  elapsedMs: elapsed,
});

export type ReservationPayload = z.output<typeof reservationSchema>;

/** Bot mengisi honeypot / mengirim terlalu cepat → sukses palsu di route. */
export function isBotSubmission(payload: { website?: string; elapsedMs: number }): boolean {
  return Boolean(payload.website) || payload.elapsedMs < 3000;
}

export function validateReservation(raw: unknown): FormResult<ReservationPayload> {
  const parsed = reservationSchema.safeParse(raw);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid submission." };
}
