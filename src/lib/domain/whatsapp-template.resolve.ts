/** Pemilihan pesan WhatsApp untuk tombol — lihat `whatsapp-template.ts`. */
import { builtInMessage } from "./whatsapp-template.contexts.ts";
import { fillTemplate } from "./whatsapp-template.render.ts";
import type { WhatsAppContextKey } from "./whatsapp-template.types.ts";

/**
 * Menentukan pesan WhatsApp untuk sebuah tombol.
 *
 * Urutan prioritas:
 * 1. `custom` — pesan khusus konten (mis. `promo.whatsappMessage`);
 * 2. `template` — template konteks dari modul Kontak & Umum;
 * 3. teks bawaan konteks (`builtInMessage`) — pesan yang dipakai selama ini.
 *
 * Setiap kandidat diisi lewat `fillTemplate`; kandidat yang hasilnya kosong
 * dilewati.
 */
export function resolveWhatsAppMessage({
  context,
  custom,
  template,
  values = {},
}: {
  context: WhatsAppContextKey;
  custom?: string | null;
  template?: string | null;
  values?: Record<string, string | number | null | undefined>;
}): string {
  for (const candidate of [custom, template, builtInMessage(context)]) {
    if (!candidate?.trim()) continue;
    const message = fillTemplate(candidate, values);
    if (message) return message;
  }
  return builtInMessage("default");
}