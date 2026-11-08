/**
 * WhatsApp is the single contact channel of the site.
 *
 * Every WhatsApp URL is built here — never hardcode a `wa.me` link in a
 * page or a component. The message wording is intentional: the guest reads
 * it inside WhatsApp.
 */

/** KAMA Spa line — `wa.me` wants digits only (no `+`, no dashes). */
export const WHATSAPP_NUMBER = "6281316052040";

/** "Talk to Roy" line, used by the corporate wellness page. */
export const CORPORATE_NUMBER = "6281314856565";

/** Generic booking — floating button, header CTA, corporate enquiries. */
export const RESERVE_MESSAGE = "Halo kak, saya mau reservasi";

/** Membership enquiries. */
export const MEMBER_MESSAGE = "Halo kak, saya mau join member";

/** Per-branch message: "is this branch open, can I book?" */
export function locationMessage(address: string): string {
  return `Halo kak, apakah yang di ${address} sudah buka dan bisa reservasi sekarang ?`;
}

/** Build a WhatsApp deep link for `message`. */
export function waLink(message: string, number: string = WHATSAPP_NUMBER): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** WhatsApp link for one specific branch (uses the branch address). */
export function locationWhatsApp(location: { address: string }): string {
  return waLink(locationMessage(location.address));
}

/**
 * Normalisasi nomor yang diisi admin menjadi format `wa.me` (digit, awalan 62).
 *
 * Admin biasa menulis `0813-1605-2040`, `+62 813 1605 2040`, atau `62813...`.
 * Mengembalikan `null` kalau hasilnya tidak masuk akal sebagai nomor Indonesia,
 * supaya pemanggil bisa jatuh ke nomor default alih-alih membuat link rusak.
 */
export function toWaNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;

  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;

  if (!digits.startsWith("62")) return null;
  // 62 + 9..13 digit nomor seluler Indonesia.
  if (digits.length < 11 || digits.length > 15) return null;

  return digits;
}

/** WhatsApp link for the corporate wellness line. */
export function corporateWhatsApp(number?: string | null): string {
  return waLink(RESERVE_MESSAGE, toWaNumber(number) ?? CORPORATE_NUMBER);
}
