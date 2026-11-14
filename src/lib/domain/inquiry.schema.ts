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