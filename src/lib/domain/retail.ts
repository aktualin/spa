/**
 * Aturan modul KAMA Retail: batas isian admin, urutan tampil katalog, dan
 * pemindahan urutan (tombol ↑/↓).
 *
 * Tidak ada keranjang/pembayaran online — setiap produk dipesan lewat
 * WhatsApp; pesan pemesanannya dirakit di `src/lib/content/retail.ts`
 * memakai registry template (`resolveWhatsAppMessage`, konteks "retail").
 * Modul murni (tanpa I/O) supaya bisa diuji langsung dengan `node --test`.
 */
import { nextSortOrderValue } from "./sort-order.ts";

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
  return nextSortOrderValue(maxSortOrder);
}
