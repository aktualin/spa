/** Skema & validasi payload Corporate Inquiry — lihat `inquiry.ts`. */
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
    .string({ error: "Name is required." })
    .trim()
    .min(2, "Name is required.")
    .max(INQUIRY_LIMITS.name, "Name is too long."),
  company: z
    .string()
    .trim()
    .max(INQUIRY_LIMITS.company, "Company name is too long.")
    .optional(),
  email: z
    .string({ error: "Email is required." })
    .trim()
    .min(1, "Email is required.")
    .max(INQUIRY_LIMITS.email, "Email is too long.")
    .email("Invalid email format."),
  phone: z
    .string()
    .trim()
    .max(INQUIRY_LIMITS.phone, "Phone number is too long.")
    .optional(),
  message: z
    .string({ error: "Message is required." })
    .trim()
    .min(10, "Message is too short.")
    .max(INQUIRY_LIMITS.message, "Message is too long (5000 characters max)."),
  captchaToken: z.string().trim().optional(),
  website: z.string().trim().optional(),
  startedAt: z.number().int().nonnegative().optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export type InquiryValidation =
  | { ok: true; data: InquiryInput }
  | { ok: false; error: string };

/**
 * Validasi payload inquiry. Mengembalikan pesan error berbahasa Inggris
 * yang aman untuk ditampilkan ke pengunjung.
 */
export function validateInquiry(raw: unknown): InquiryValidation {
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? "Invalid submission." };
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
