/**
 * Logika murni fitur Newsletter: validasi signup publik (anti-spam dipakai
 * ulang dari `corporate.ts`), dan pembungkus HTML/text email kampanye.
 *
 * Modul murni (tanpa I/O, tanpa Next/Prisma) supaya bisa diuji langsung
 * dengan `node --test`.
 */
import { randomBytes } from "node:crypto";

import { z } from "zod";

import { escapeHtml } from "./corporate.ts";
import { stripTags } from "./sanitize.ts";

export { checkFillTime, MIN_INQUIRY_FILL_MS, MAX_INQUIRY_BODY } from "./corporate.ts";

/* ------------------------------------------------------------------ */
/* Validasi signup publik                                              */
/* ------------------------------------------------------------------ */

export const NEWSLETTER_LIMITS = {
  email: 254,
} as const;

export const newsletterSubscribeSchema = z.object({
  email: z
    .string({ error: "Email wajib diisi." })
    .trim()
    .min(1, "Email wajib diisi.")
    .max(NEWSLETTER_LIMITS.email, "Email terlalu panjang.")
    .email("Format email tidak valid."),
  branchSlug: z.string().trim().optional(),
  website: z.string().trim().optional(),
  elapsedMs: z.number().optional(),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

export type NewsletterSubscribeValidation =
  | { ok: true; data: NewsletterSubscribeInput }
  | { ok: false; error: string };

/** Validasi payload signup newsletter. Pesan error aman ditampilkan ke pengunjung. */
export function validateNewsletterSubscribe(raw: unknown): NewsletterSubscribeValidation {
  const parsed = newsletterSubscribeSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? "Input tidak valid." };
  }
  const data = parsed.data;
  return {
    ok: true,
    data: {
      ...data,
      email: data.email.toLowerCase(),
      branchSlug: data.branchSlug ? data.branchSlug : undefined,
      website: data.website ? data.website : undefined,
    },
  };
}

/** Token unsubscribe: acak, tidak bisa ditebak, tidak dirotasi otomatis. */
export function generateUnsubscribeToken(): string {
  return randomBytes(24).toString("base64url");
}

/* ------------------------------------------------------------------ */
/* Validasi admin: kampanye & pengaturan                               */
/* ------------------------------------------------------------------ */

export const NEWSLETTER_CAMPAIGN_LIMITS = {
  subject: 150,
  previewText: 150,
} as const;

export type Validation<T> = { ok: true; data: T } | { ok: false; error: string };

export type NewsletterCampaignData = {
  subject: string;
  previewText: string | null;
  bodyHtml: string;
};

/** `bodyHtml` di sini sudah disanitasi oleh caller (`sanitizeHtml`). */
export function validateNewsletterCampaignInput(input: {
  subject: string;
  previewText: string;
  bodyHtml: string;
}): Validation<NewsletterCampaignData> {
  const subject = input.subject.replace(/\s+/g, " ").trim();
  if (!subject) return { ok: false, error: "Subjek wajib diisi." };
  if (subject.length > NEWSLETTER_CAMPAIGN_LIMITS.subject) {
    return { ok: false, error: `Subjek maksimal ${NEWSLETTER_CAMPAIGN_LIMITS.subject} karakter.` };
  }
  const previewText = input.previewText.trim();
  if (previewText.length > NEWSLETTER_CAMPAIGN_LIMITS.previewText) {
    return {
      ok: false,
      error: `Teks preview maksimal ${NEWSLETTER_CAMPAIGN_LIMITS.previewText} karakter.`,
    };
  }
  const bodyHtml = input.bodyHtml.trim();
  if (!bodyHtml) return { ok: false, error: "Isi kampanye wajib diisi." };

  return { ok: true, data: { subject, previewText: previewText || null, bodyHtml } };
}

export type NewsletterSettingsData = {
  headerHtml: string | null;
  footerHtml: string | null;
  senderName: string | null;
  replyTo: string | null;
  physicalAddress: string | null;
  unsubscribeNotice: string | null;
};

/** `headerHtml`/`footerHtml` di sini sudah disanitasi oleh caller. */
export function validateNewsletterSettingsInput(input: {
  headerHtml: string;
  footerHtml: string;
  senderName: string;
  replyTo: string;
  physicalAddress: string;
  unsubscribeNotice: string;
}): Validation<NewsletterSettingsData> {
  const replyTo = input.replyTo.trim();
  if (replyTo && !z.string().email().safeParse(replyTo).success) {
    return { ok: false, error: "Format email reply-to tidak valid." };
  }
  return {
    ok: true,
    data: {
      headerHtml: input.headerHtml.trim() || null,
      footerHtml: input.footerHtml.trim() || null,
      senderName: input.senderName.trim() || null,
      replyTo: replyTo || null,
      physicalAddress: input.physicalAddress.trim() || null,
      unsubscribeNotice: input.unsubscribeNotice.trim() || null,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Email kampanye                                                       */
/* ------------------------------------------------------------------ */

export type NewsletterCampaignEmailInput = {
  subject: string;
  previewText: string | null;
  /** HTML isi kampanye — sudah disanitasi saat campaign disimpan. */
  bodyHtml: string;
  /** HTML header/footer global — sudah disanitasi saat Settings disimpan. */
  headerHtml: string | null;
  footerHtml: string | null;
  unsubscribeUrl: string;
  physicalAddress: string | null;
  unsubscribeNotice: string | null;
};

/**
 * Bungkus isi kampanye dalam shell email (table-based, inline style saja —
 * `<style>` dibuang `sanitizeHtml` dan diabaikan banyak email client).
 * Isi `bodyHtml`/`headerHtml`/`footerHtml` dipercaya sudah disanitasi di
 * save-time; fungsi ini hanya membungkus, tidak sanitasi ulang.
 */
export function buildNewsletterCampaignEmail(input: NewsletterCampaignEmailInput): {
  subject: string;
  text: string;
  html: string;
} {
  const preheader = input.previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.previewText)}</div>`
    : "";

  const footerNotice = [
    input.unsubscribeNotice ? `<p style="margin:8px 0 0;">${escapeHtml(input.unsubscribeNotice)}</p>` : "",
    input.physicalAddress ? `<p style="margin:8px 0 0;">${escapeHtml(input.physicalAddress)}</p>` : "",
    `<p style="margin:8px 0 0;"><a href="${escapeHtml(input.unsubscribeUrl)}">Berhenti berlangganan</a></p>`,
  ].join("");

  const html = [
    '<!doctype html><html><body style="margin:0;padding:0;background:#f6f1e9;">',
    preheader,
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e9;">',
    "<tr><td align=\"center\">",
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;margin:0 auto;background:#ffffff;">',
    input.headerHtml ? `<tr><td style="padding:24px;">${input.headerHtml}</td></tr>` : "",
    `<tr><td style="padding:24px;color:#2a2420;">${input.bodyHtml}</td></tr>`,
    `<tr><td style="padding:24px;border-top:1px solid #e5ddd2;color:#888;font-size:12px;">${input.footerHtml ?? ""}${footerNotice}</td></tr>`,
    "</table>",
    "</td></tr></table>",
    "</body></html>",
  ].join("");

  const text = [
    stripTags(input.bodyHtml),
    "",
    "Berhenti berlangganan:",
    input.unsubscribeUrl,
  ].join("\n");

  return { subject: input.subject, text, html };
}
