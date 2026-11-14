/** Struktur pohon menu (kedalaman, siklus, induk) — lihat `menu.ts`. */
import { MAX_MENU_DEPTH } from "./menu.types.ts";

export type Link = { id: string; parentId: string | null };

export function parentMap(rows: readonly Link[]): Map<string, string | null> {
  return new Map(rows.map((r) => [r.id, r.parentId]));
}

/** Kedalaman item (level 1 = akar). Infinity bila rantai induknya berputar. */
export function depthOf(rows: readonly Link[], id: string): number {
  const parents = parentMap(rows);
  let depth = 1;
  let current = parents.get(id) ?? null;
  const seen = new Set([id]);
  while (current !== null) {
    if (seen.has(current)) return Infinity;
    seen.add(current);
    depth += 1;
    current = parents.get(current) ?? null;
  }
  return depth;
}

/** Tinggi subpohon: 1 untuk item tanpa anak. */
export function subtreeHeight(rows: readonly Link[], id: string): number {
  const children = rows.filter((r) => r.parentId === id);
  if (children.length === 0) return 1;
  return 1 + Math.max(...children.map((c) => subtreeHeight(rows, c.id)));
}

function isDescendant(rows: readonly Link[], ancestorId: string, id: string): boolean {
  const parents = parentMap(rows);
  let current = parents.get(id) ?? null;
  const seen = new Set<string>();
  while (current !== null && !seen.has(current)) {
    if (current === ancestorId) return true;
    seen.add(current);
    current = parents.get(current) ?? null;
  }
  return false;
}

/**
 * Validasi memindah/menaruh `itemId` (null = item baru) di bawah `parentId`.
 */
export function validateParent(
  rows: readonly Link[],
  itemId: string | null,
  parentId: string | null,
): string | null {
  if (parentId === null) {
    return itemId && subtreeHeight(rows, itemId) > MAX_MENU_DEPTH
      ? `Menu maksimal ${MAX_MENU_DEPTH} level.`
      : null;
  }
  if (itemId && parentId === itemId) return "Item menu tidak boleh menjadi induk dirinya sendiri.";
  if (!rows.some((r) => r.id === parentId)) return "Induk menu tidak ditemukan.";
  if (itemId && isDescendant(rows, itemId, parentId)) {
    return "Item tidak boleh dipindah ke dalam sub-menunya sendiri (membentuk siklus).";
  }
  const height = itemId ? subtreeHeight(rows, itemId) : 1;
  if (depthOf(rows, parentId) + height > MAX_MENU_DEPTH) {
    return `Menu maksimal ${MAX_MENU_DEPTH} level (induk → sub-menu → sub-sub-menu).`;
  }
  return null;
}

/** Validasi seluruh struktur, dipakai saat menyimpan hasil drag-and-drop. */
export function validateStructure(rows: readonly Link[]): string | null {
  const ids = new Set(rows.map((r) => r.id));
  for (const row of rows) {
    if (row.parentId === row.id) return "Item menu tidak boleh menjadi induk dirinya sendiri.";
    if (row.parentId !== null && !ids.has(row.parentId)) return "Induk menu tidak ditemukan.";
  }
  for (const row of rows) {
    const depth = depthOf(rows, row.id);
    if (depth === Infinity) return "Struktur menu membentuk siklus.";
    if (depth > MAX_MENU_DEPTH) return `Menu maksimal ${MAX_MENU_DEPTH} level.`;
  }
  return null;
}

export function canAddChild(rows: readonly Link[], id: string): boolean {
  return depthOf(rows, id) < MAX_MENU_DEPTH;
}