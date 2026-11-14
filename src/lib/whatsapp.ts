/**
 * WhatsApp is the single contact channel of the site.
 *
 * Every WhatsApp URL is built here — never hardcode a `wa.me` link in a
 * page or a component. Nomor dan pesan sepenuhnya data admin
 * (`SiteSettings.whatsappNumber`, `Branch.whatsappNumber`, `CorporateContent.picPhone`,
 * dan `WhatsAppTemplate` per konteks); tidak ada konstanta nomor/pesan di kode.
 *
 * Halaman publik memakai `whatsAppHref()` / `branchWhatsAppHref()` /
 * `corporateWhatsAppHref()` dari `@/lib/content/whatsapp` yang membaca
 * pengaturan ber-cache; hasil `null` berarti tombol disembunyikan.
 */
import {
  buildWhatsAppLink,
  normalizeWaNumber,
} from "./domain/whatsapp-template.ts";

/** Build a WhatsApp deep link for `message`; `number` digit saja (wa.me). */
export function waLink(message: string, number: string): string {
  return buildWhatsAppLink(message, number);
}

/**
 * Normalisasi nomor yang diisi admin menjadi format `wa.me` (digit, awalan 62).
 * `null` bila tidak masuk akal sebagai nomor Indonesia — pemanggil
 * menyembunyikan tombolnya, bukan membuat link rusak.
 */
export function toWaNumber(raw: string | null | undefined): string | null {
  return normalizeWaNumber(raw);
}

/**
 * Link "Talk to …" corporate: nomor PIC menang, lalu nomor situs.
 * `null` bila keduanya kosong — tombol disembunyikan.
 */
export function corporateWhatsApp(
  picNumber: string | null | undefined,
  siteNumber: string | null | undefined,
  message: string,
): string | null {
  const number = toWaNumber(picNumber) ?? toWaNumber(siteNumber);
  return number ? waLink(message, number) : null;
}
