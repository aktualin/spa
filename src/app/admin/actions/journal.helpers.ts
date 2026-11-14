import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  JOURNAL_BASE_PATH,
  JOURNAL_EXCERPT_MAX,
  JOURNAL_SEO_DESCRIPTION_MAX,
  JOURNAL_SEO_TITLE_MAX,
  JOURNAL_TITLE_MAX,
  isRichTextEmpty,
  journalPath,
  validateJournalSlug,
} from "@/lib/domain/journal";
import { plainTextToHtml } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";

import { JOURNAL_STATUSES } from "../journal/journal-status";
import { optionalImageUrl, optionalText } from "../promos/_kit/schema";
import { revalidateRedirects } from "./redirects.helpers";

export type ActionState = { error: string | null; ok?: boolean };

export const SLUG_TAKEN = (slug: string) => `Slug "${slug}" sudah dipakai artikel lain.`;

export const postSchema = z.object({
  slug: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      const message = validateJournalSlug(value);
      if (message) ctx.addIssue({ code: "custom", message });
    }),
  title: z
    .string()
    .trim()
    .min(1, "Judul artikel wajib diisi.")
    .max(JOURNAL_TITLE_MAX, `Judul maksimal ${JOURNAL_TITLE_MAX} karakter.`),
  excerpt: optionalText.refine(
    (value) => !value || value.length <= JOURNAL_EXCERPT_MAX,
    `Ringkasan maksimal ${JOURNAL_EXCERPT_MAX} karakter.`,
  ),
  bodyHtml: z
    .string()
    .optional()
    // Teks polos (mis. hasil tempel) dijadikan paragraf, lalu WAJIB disanitasi.
    .transform((value) => sanitizeHtml(plainTextToHtml(value ?? "")))
    .refine((value) => !isRichTextEmpty(value), "Isi artikel wajib diisi."),
  coverUrl: optionalImageUrl,
  // Kategori kini baris JournalCategory; form mengirim id, kosong = tanpa kategori.
  categoryId: optionalText,
  status: z.enum(JOURNAL_STATUSES, { message: "Status tidak dikenal." }),
  seoTitle: optionalText.refine(
    (value) => !value || value.length <= JOURNAL_SEO_TITLE_MAX,
    `Meta title maksimal ${JOURNAL_SEO_TITLE_MAX} karakter.`,
  ),
  seoDescription: optionalText.refine(
    (value) => !value || value.length <= JOURNAL_SEO_DESCRIPTION_MAX,
    `Meta description maksimal ${JOURNAL_SEO_DESCRIPTION_MAX} karakter.`,
  ),
});

export function revalidateJournal(slugs: (string | null | undefined)[], redirectsChanged: boolean) {
  updateTag(CONTENT_TAGS.journal);
  if (redirectsChanged) revalidateRedirects();
  revalidatePath("/admin/journal");
  revalidatePath(JOURNAL_BASE_PATH);
  // Halaman Our Story menampilkan tiga tulisan terbaru.
  revalidatePath("/our-story");
  revalidatePath("/sitemap.xml");
  for (const slug of new Set(slugs)) {
    if (slug) revalidatePath(journalPath(slug));
  }
}