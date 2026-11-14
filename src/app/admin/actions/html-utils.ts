import { plainTextToHtml } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";

/**
 * Syarat & ketentuan polos → HTML aman. Null bila hasilnya kosong secara
 * terlihat (dipakai bersama oleh promo dan tier membership).
 */
export function termsToHtml(terms: string | null | undefined): string | null {
  if (!terms) return null;
  const html = sanitizeHtml(plainTextToHtml(terms));
  return /\S/.test(html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")) ? html : null;
}