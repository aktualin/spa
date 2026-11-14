/**
 * Template pesan WhatsApp (click-to-chat `wa.me`, tanpa API berbayar).
 *
 * Admin mengatur template pesan per konteks (default, treatment, package,
 * promo, gift, membership, retail) di modul Kontak & Umum → Template WhatsApp.
 * Template boleh memuat placeholder seperti `{{treatment}}`; daftar
 * placeholder yang benar-benar terisi ada di `WHATSAPP_CONTEXTS`.
 *
 * Modul ini murni (tanpa I/O) supaya bisa diuji dengan `node --test`.
 * Implementasinya dipecah ke berkas `whatsapp-template.*.ts` di folder ini;
 * berkas ini hanya mengekspor ulang simbol publiknya.
 */

export {
  MAX_TEMPLATE_LENGTH,
  renderTemplate,
  extractPlaceholders,
  fillTemplate,
  buildWhatsAppLink,
  normalizeWaNumber,
} from "./whatsapp-template.render.ts";
export type {
  WhatsAppContextKey,
  WhatsAppPlaceholder,
  WhatsAppContextDefinition,
} from "./whatsapp-template.types.ts";
export {
  WHATSAPP_CONTEXTS,
  WHATSAPP_CONTEXT_KEYS,
  isSystemTemplateKey,
  getContextDefinition,
  builtInMessage,
  allowedPlaceholders,
  sampleValues,
} from "./whatsapp-template.contexts.ts";
export {
  type TemplateValidation,
  validateTemplate,
} from "./whatsapp-template.validate.ts";
export { resolveWhatsAppMessage } from "./whatsapp-template.resolve.ts";