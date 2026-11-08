/**
 * Aturan pelacakan GA4 (modul murni): nama event dan nama konteks yang aman
 * dikirim. Hanya metadata — tidak pernah isi pesan, nomor, atau data formulir.
 */

export const TRACK_EVENT_WHATSAPP = "whatsapp_click";
export const TRACK_EVENT_FORM = "form_submit";
/** Event kustom di window yang dipakai komponen client untuk melapor. */
export const TRACK_WINDOW_EVENT = "kama:track";

const SAFE_LABEL = /^[a-z0-9_-]{1,40}$/;

/** Label konteks/form yang aman; selain itu → "unknown". */
export function safeTrackLabel(value: string | null | undefined): string {
  const label = (value ?? "").trim().toLowerCase();
  return SAFE_LABEL.test(label) ? label : "unknown";
}

/** Tautan click-to-chat WhatsApp (wa.me atau api.whatsapp.com)? */
export function isWhatsAppHref(href: string | null | undefined): boolean {
  if (!href) return false;
  try {
    const host = new URL(href, "https://example.invalid").hostname;
    return host === "wa.me" || host === "api.whatsapp.com" || host === "wa.link";
  } catch {
    return false;
  }
}
