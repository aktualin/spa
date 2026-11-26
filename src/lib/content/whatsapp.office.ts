/** Tautan WhatsApp kantor untuk footer — lihat `whatsapp.ts`. */
import {
  buildWhatsAppLink,
  normalizeWaNumber,
  resolveWhatsAppMessage,
} from "@/lib/domain/whatsapp-template";

import { getSiteSettings, getWhatsAppTemplate } from "./site";

/**
 * Link `https://wa.me/<nomor kantor>?text=…` untuk baris "Connect With Us" di
 * footer; pesan dari template konteks "office" (fallback teks bawaan registry).
 * Mengembalikan `null` bila `SiteSettings.officeWhatsappNumber` kosong atau
 * tidak valid — footer menyembunyikan barisnya.
 *
 * Sengaja TIDAK fallback ke `whatsappNumber`: saluran kantor dan saluran
 * booking (tombol melayang/reservasi) terpisah by design.
 */
export async function officeWhatsAppHref(): Promise<string | null> {
  const [settings, template] = await Promise.all([
    getSiteSettings(),
    getWhatsAppTemplate("office"),
  ]);
  const number = normalizeWaNumber(settings.officeWhatsappNumber);
  if (!number) return null;
  const message = resolveWhatsAppMessage({ context: "office", template });
  return buildWhatsAppLink(message, number);
}
