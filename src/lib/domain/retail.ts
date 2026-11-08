/**
 * Aturan modul KAMA Retail: batas isian admin, urutan tampil katalog,
 * pemindahan urutan (tombol ↑/↓), dan pesan WhatsApp pemesanan produk.
 *
 * Tidak ada keranjang/pembayaran online — setiap produk dipesan lewat
 * WhatsApp. Modul murni (tanpa I/O) supaya bisa diuji langsung dengan
 * `node --test`.
 */
import { formatIdr } from "../format.ts";
import { renderTemplate } from "./whatsapp-template.ts";

/** Batas panjang isian form produk retail. */
export const RETAIL_LIMITS = {
  name: 120,
  description: 2000,
  whatsappMessage: 500,
} as const;

/* ---------- urutan tampil ---------- */

export type RetailOrderRow = {
  id: string;
  name: string;
  isHighlight: boolean;
  sortOrder: number;
};

/**
 * Urutan baku katalog: produk Highlight/Kolaborasi lebih dulu, lalu menurut
 * `sortOrder`, nama, dan id (supaya hasilnya stabil). Dipakai bersama oleh
 * daftar admin dan halaman publik `/retail` agar urutannya selalu sama.
 */
export function compareRetailProducts(a: RetailOrderRow, b: RetailOrderRow): number {
  if (a.isHighlight !== b.isHighlight) return a.isHighlight ? -1 : 1;
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  const byName = a.name.localeCompare(b.name, "id");
  if (byName !== 0) return byName;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function sortRetailProducts<T extends RetailOrderRow>(rows: readonly T[]): T[] {
  return [...rows].sort(compareRetailProducts);
}

/**
 * Menaikkan/menurunkan satu produk dalam urutan tampil.
 *
 * Produk hanya bertukar tempat dengan tetangga di kelompok yang sama
 * (Highlight dengan Highlight, biasa dengan biasa), karena Highlight selalu
 * tampil lebih dulu. Hasilnya `sortOrder` baru 0..n-1 untuk seluruh produk
 * menurut urutan baru — nilai kembar dari data lama ikut dirapikan. Hanya
 * baris yang nilainya berubah yang dikembalikan.
 */
export function planRetailMove(
  rows: readonly RetailOrderRow[],
  id: string,
  direction: "up" | "down",
): { id: string; sortOrder: number }[] {
  const ordered = sortRetailProducts(rows);
  const index = ordered.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;

  if (
    index >= 0 &&
    target >= 0 &&
    target < ordered.length &&
    ordered[target].isHighlight === ordered[index].isHighlight
  ) {
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  }

  return ordered
    .map((row, position) => ({ id: row.id, sortOrder: position, previous: row.sortOrder }))
    .filter((row) => row.sortOrder !== row.previous)
    .map(({ id: rowId, sortOrder }) => ({ id: rowId, sortOrder }));
}

/** true bila produk bisa dinaikkan/diturunkan (tetangganya satu kelompok). */
export function canMoveRetail(
  ordered: readonly RetailOrderRow[],
  index: number,
  direction: "up" | "down",
): boolean {
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || index >= ordered.length) return false;
  if (target < 0 || target >= ordered.length) return false;
  return ordered[target].isHighlight === ordered[index].isHighlight;
}

/** `sortOrder` untuk produk baru: di akhir daftar. */
export function nextRetailSortOrder(maxSortOrder: number | null | undefined): number {
  return typeof maxSortOrder === "number" && Number.isFinite(maxSortOrder)
    ? maxSortOrder + 1
    : 0;
}

/* ---------- pesan WhatsApp ---------- */

/** Template bawaan bila admin belum mengatur template "retail". */
export const DEFAULT_RETAIL_TEMPLATE = "Halo kak, saya mau pesan produk {{product}}";

const NAME_KEYS = ["product", "produk", "nama", "name"] as const;
const PRICE_KEYS = ["harga", "price"] as const;

function hasPlaceholder(template: string, keys: readonly string[]): boolean {
  return keys.some((key) => new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`).test(template));
}

export type RetailMessageInput = {
  name: string;
  priceIdr: number | null;
  whatsappMessage: string | null;
};

/**
 * Pesan WhatsApp untuk tombol "Pesan via WhatsApp" sebuah produk.
 *
 * 1. Pesan khusus produk (`whatsappMessage`) dipakai apa adanya.
 * 2. Kalau kosong, dipakai template "retail" dari modul Kontak & Umum
 *    (`template`) — asalkan template itu memuat placeholder nama produk.
 * 3. Kalau tidak ada, dipakai `DEFAULT_RETAIL_TEMPLATE`.
 *
 * Placeholder yang didukung: `{{product}}`/`{{produk}}`/`{{nama}}`/`{{name}}`
 * dan `{{harga}}`/`{{price}}`. Bila produk berharga tetapi template tidak
 * memuat placeholder harga, harga ditambahkan di akhir dalam kurung.
 */
export function retailOrderMessage(
  product: RetailMessageInput,
  template?: string | null,
): string {
  const price = product.priceIdr === null ? null : formatIdr(product.priceIdr);
  const values: Record<string, string | null> = {
    product: product.name,
    produk: product.name,
    nama: product.name,
    name: product.name,
    harga: price,
    price,
  };

  const custom = product.whatsappMessage?.trim();
  if (custom) return dropEmptyPrice(renderTemplate(custom, values));

  const configured = template?.trim();
  const base =
    configured && hasPlaceholder(configured, NAME_KEYS)
      ? configured
      : DEFAULT_RETAIL_TEMPLATE;

  let message = renderTemplate(base, values);
  if (price && !hasPlaceholder(base, PRICE_KEYS)) message = `${message} (${price})`;
  return dropEmptyPrice(message);
}

/** Placeholder harga pada produk tanpa harga tidak boleh tampil mentah. */
function dropEmptyPrice(message: string): string {
  if (!/\{\{\s*(?:harga|price)\s*\}\}/.test(message)) return message;
  return message
    .replace(/\{\{\s*(?:harga|price)\s*\}\}/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
