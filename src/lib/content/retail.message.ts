/** Pesan "Pesan via WhatsApp" produk retail — lihat `retail.ts`. */
import { formatIdr } from "@/lib/format";
import {
  builtInMessage,
  resolveWhatsAppMessage,
} from "@/lib/domain/whatsapp-template";

import type { RetailProduct } from "./retail.products";

/**
 * Pesan "Pesan via WhatsApp" sebuah produk: pesan khusus produk → template
 * konteks "retail" (Kontak & Umum) → teks bawaan registry. Placeholder
 * {{product}}/{{harga}} (alias {{price}}) diisi di sini. Bila produk berharga
 * tetapi template tidak memuat placeholder harga, harga ditambahkan di akhir
 * dalam kurung — perilaku lama dipertahankan.
 */
export function retailMessage(product: RetailProduct, template: string | null): string {
  const price = product.priceIdr === null ? null : formatIdr(product.priceIdr);
  // Alias placeholder konteks "retail" (lihat WHATSAPP_CONTEXTS) ikut diisi.
  const values = {
    product: product.name,
    produk: product.name,
    nama: product.name,
    name: product.name,
    harga: price,
    price,
  };
  const custom = product.whatsappMessage?.trim();
  // Pesan khusus produk dipakai apa adanya — tanpa tambahan harga.
  if (custom) return resolveWhatsAppMessage({ context: "retail", custom, values });
  const message = resolveWhatsAppMessage({ context: "retail", template, values });
  const base = template?.trim() || builtInMessage("retail");
  if (price && !/\{\{\s*(?:harga|price)\s*\}\}/.test(base)) {
    return `${message} (${price})`;
  }
  return message;
}