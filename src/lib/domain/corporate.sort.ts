/** Urutan ↑/↓ baris corporate — lihat `corporate.ts`. */
import { moveInList } from "./media.ts";
import { nextSortOrderValue } from "./sort-order.ts";

export type SortRow = { id: string; sortOrder: number };

/**
 * Pindahkan satu baris ke atas/bawah. `rows` harus sudah terurut seperti yang
 * tampil. Hasil: hanya baris yang `sortOrder`-nya berubah (urutan dirapatkan
 * menjadi 0..n-1).
 */
export function reorderUpdates(
  rows: readonly SortRow[],
  id: string,
  direction: "up" | "down",
): SortRow[] {
  const current = new Map(rows.map((row) => [row.id, row.sortOrder]));
  if (!current.has(id)) return [];
  const ordered = moveInList(
    rows.map((row) => row.id),
    id,
    direction,
  );
  return ordered
    .map((rowId, index) => ({ id: rowId, sortOrder: index }))
    .filter((row) => current.get(row.id) !== row.sortOrder);
}

/** `sortOrder` untuk item baru di akhir daftar. */
export function nextSortOrder(max: number | null | undefined): number {
  return nextSortOrderValue(max);
}

export function readDirection(value: unknown): "up" | "down" | null {
  return value === "up" || value === "down" ? value : null;
}