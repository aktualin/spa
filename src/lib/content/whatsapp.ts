/**
 * Bacaan publik tautan WhatsApp click-to-chat (`wa.me`, tanpa API berbayar).
 *
 * Nomor diambil dari pengaturan situs (`SiteSettings.whatsappNumber`) dan
 * pesan dari template per konteks (`WhatsAppTemplate`) — keduanya lewat
 * bacaan ber-cache di `./site` (tag `CONTENT_TAGS.settings`), sehingga
 * perubahan di admin langsung tampil tanpa redeploy.
 *
 * Urutan prioritas pesan: pesan khusus konten → template konteks → teks
 * bawaan konteks (lihat `resolveWhatsAppMessage`).
 */
import {
  buildWhatsAppLink,
  normalizeWaNumber,
  resolveWhatsAppMessage,
  type WhatsAppContextKey,
} from "@/lib/domain/whatsapp-template";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

import { getWhatsAppNumber, getWhatsAppTemplate } from "./site";

/** Nomor WhatsApp situs dalam format `wa.me` (digit, awalan 62). */
export async function getWaNumber(): Promise<string> {
  const raw = await getWhatsAppNumber();
  return normalizeWaNumber(raw) ?? WHATSAPP_NUMBER;
}

export type WhatsAppHrefOptions = {
  /** Pesan khusus konten (mis. `promo.whatsappMessage`); menang bila diisi. */
  custom?: string | null;
  /** Nilai placeholder, mis. `{ treatment: "Sukma Laya" }`. */
  values?: Record<string, string | number | null | undefined>;
};

/** Pesan WhatsApp final untuk sebuah konteks. */
export async function getWhatsAppMessage(
  context: WhatsAppContextKey,
  { custom, values }: WhatsAppHrefOptions = {},
): Promise<string> {
  const template = await getWhatsAppTemplate(context);
  return resolveWhatsAppMessage({ context, custom, template, values });
}

/** Tautan `https://wa.me/<nomor>?text=…` untuk sebuah konteks. */
export async function whatsAppHref(
  context: WhatsAppContextKey,
  options: WhatsAppHrefOptions = {},
): Promise<string> {
  const [number, message] = await Promise.all([
    getWaNumber(),
    getWhatsAppMessage(context, options),
  ]);
  return buildWhatsAppLink(message, number);
}
