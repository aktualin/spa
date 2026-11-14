/** Perpindahan urutan highlight — lihat `homepage.ts`. */

/**
 * Urutan baru setelah memindahkan `id` satu langkah ke atas/bawah. Hasilnya
 * daftar id berurutan (indeks = `sortOrder` baru), atau null bila tidak
 * berubah. Penomoran ulang 0..n menghindari masalah `sortOrder` kembar.
 */
export function reorderIds(
  orderedIds: string[],
  id: string,
  direction: "up" | "down",
): string[] | null {
  const index = orderedIds.indexOf(id);
  if (index === -1) return null;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= orderedIds.length) return null;
  const next = [...orderedIds];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}