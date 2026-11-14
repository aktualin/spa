/** Urutan tampil daftar cabang — lihat `branch.ts`. */
import { nextSortOrderValue } from "./sort-order.ts";

export type BranchOrderRow = {
  id: string;
  name: string;
  sortOrder: number;
};

/**
 * Urutan baku daftar cabang: `sortOrder`, lalu nama dan id supaya hasilnya
 * stabil. Dipakai bersama oleh daftar admin dan halaman publik agar urutannya
 * selalu sama.
 */
export function compareBranches(a: BranchOrderRow, b: BranchOrderRow): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  const byName = a.name.localeCompare(b.name, "id");
  if (byName !== 0) return byName;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function sortBranches<T extends BranchOrderRow>(rows: readonly T[]): T[] {
  return [...rows].sort(compareBranches);
}

/**
 * Menaikkan/menurunkan satu cabang dalam urutan tampil. Hasilnya `sortOrder`
 * baru 0..n-1 untuk seluruh cabang, sehingga nilai kembar dari data lama ikut
 * dirapikan. Hanya baris yang nilainya berubah yang dikembalikan.
 */
export function planBranchMove(
  rows: readonly BranchOrderRow[],
  id: string,
  direction: "up" | "down",
): { id: string; sortOrder: number }[] {
  const ordered = sortBranches(rows);
  const index = ordered.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;

  if (index >= 0 && target >= 0 && target < ordered.length) {
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  }

  return ordered
    .map((row, position) => ({ id: row.id, sortOrder: position, previous: row.sortOrder }))
    .filter((row) => row.sortOrder !== row.previous)
    .map(({ id: rowId, sortOrder }) => ({ id: rowId, sortOrder }));
}

/** true bila cabang bisa dinaikkan/diturunkan (ada tetangga ke arah itu). */
export function canMoveBranch(
  ordered: readonly BranchOrderRow[],
  index: number,
  direction: "up" | "down",
): boolean {
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || index >= ordered.length) return false;
  return target >= 0 && target < ordered.length;
}

/** `sortOrder` untuk cabang baru: di akhir daftar. */
export function nextBranchSortOrder(maxSortOrder: number | null | undefined): number {
  return nextSortOrderValue(maxSortOrder);
}