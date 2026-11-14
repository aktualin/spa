/** Helper bersama section homepage (statistik, ulasan, feed). */

export type OrderedRow = { isPublished: boolean; sortOrder: number };

/** Hanya baris terbit, urut `sortOrder` naik (stabil). */
export function publishedInOrder<T extends OrderedRow>(rows: T[]): T[] {
  return rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.isPublished)
    .sort((a, b) => a.row.sortOrder - b.row.sortOrder || a.index - b.index)
    .map(({ row }) => row);
}

export type SimpleValidation<T> = { ok: true; data: T } | { ok: false; error: string };