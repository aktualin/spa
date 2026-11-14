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

import { getWhatsAppNumber, getWhatsAppTemplate } from "./site";

/**
 * Nomor WhatsApp situs dalam format `wa.me` (digit, awalan 62), atau `null`
 * bila admin belum mengisinya — pemanggil menyembunyikan tombolnya.
 */
export async function getWaNumber(): Promise<string | null> {
  const raw = await getWhatsAppNumber();
  return normalizeWaNumber(raw);
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

/**
 * Tautan `https://wa.me/<nomor>?text=…` untuk sebuah konteks, atau `null`
 * bila nomor WhatsApp belum diatur di Kontak & Umum.
 */
export async function whatsAppHref(
  context: WhatsAppContextKey,
  options: WhatsAppHrefOptions = {},
): Promise<string | null> {
  const [number, message] = await Promise.all([
    getWaNumber(),
    getWhatsAppMessage(context, options),
  ]);
  return number ? buildWhatsAppLink(message, number) : null;
}

/**
 * Link WhatsApp kartu cabang: nomor cabang menang, lalu nomor situs;
 * pesan dari template konteks "location" dengan placeholder {{address}}.
 */
export async function branchWhatsAppHref(branch: {
  address?: string | null;
  whatsappNumber?: string | null;
}): Promise<string | null> {
  const [siteNumber, message] = await Promise.all([
    getWaNumber(),
    getWhatsAppMessage("location", { values: { address: branch.address ?? "" } }),
  ]);
  const number = normalizeWaNumber(branch.whatsappNumber) ?? siteNumber;
  return number ? buildWhatsAppLink(message, number) : null;
}

/** Link "Talk to …" corporate: nomor PIC menang, lalu nomor situs. */
export async function corporateWhatsAppHref(
  picPhone?: string | null,
): Promise<string | null> {
  const [siteNumber, message] = await Promise.all([
    getWaNumber(),
    getWhatsAppMessage("default"),
  ]);
  const number = normalizeWaNumber(picPhone) ?? siteNumber;
  return number ? buildWhatsAppLink(message, number) : null;
}
