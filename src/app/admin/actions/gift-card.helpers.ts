import { z } from "zod";

import { sanitizeHtml } from "@/lib/domain/sanitize";

import { optionalImageUrl, optionalText } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

export const giftCardSchema = z.object({
  title: z.string().trim().min(1, "Judul gift card wajib diisi.").max(120, "Judul maksimal 120 karakter."),
  subtitle: optionalText.refine((v) => !v || v.length <= 200, "Subjudul maksimal 200 karakter."),
  bodyHtml: z.string().trim().min(1, "Isi gift card wajib diisi."),
  imageUrl: optionalImageUrl,
  termsHtml: optionalText,
  whatsappMessage: optionalText.refine(
    (v) => !v || v.length <= 500,
    "Pesan WhatsApp maksimal 500 karakter.",
  ),
});

/** HTML editor → HTML tersanitasi; null bila tidak ada teks yang terlihat. */
export function cleanHtml(value: string | null): string | null {
  if (!value) return null;
  const html = sanitizeHtml(value);
  return /\S/.test(html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")) ? html : null;
}