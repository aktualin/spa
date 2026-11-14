/** Penomoran `sortOrder` untuk item baru di akhir daftar (dipakai bersama). */

/** `sortOrder` berikutnya dari nilai maksimum; belum ada baris → 0. */
export function nextSortOrderValue(max: number | null | undefined): number {
  return typeof max === "number" && Number.isFinite(max) ? max + 1 : 0;
}