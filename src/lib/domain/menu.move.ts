/** Perpindahan item menu (drag-and-drop & naik/turun) — lihat `menu.ts`. */
import { type Link, validateParent } from "./menu.tree.ts";

export type Sortable = Link & { sortOrder: number; label: string };

function compareItems(a: Sortable, b: Sortable): number {
  return a.sortOrder - b.sortOrder || a.label.localeCompare(b.label) || a.id.localeCompare(b.id);
}

export function siblingsOf<T extends Sortable>(rows: readonly T[], parentId: string | null): T[] {
  return rows.filter((r) => r.parentId === parentId).sort(compareItems);
}

function withOrder<T extends Sortable>(rows: readonly T[], parentId: string | null, ordered: T[]): T[] {
  const order = new Map(ordered.map((r, index) => [r.id, index]));
  return rows.map((r) =>
    order.has(r.id) ? { ...r, parentId, sortOrder: order.get(r.id)! } : r,
  );
}

export type DropPosition = "before" | "after" | "inside";

export type MoveResult<T> = { rows: T[]; error: null } | { rows: null; error: string };

/** Pindahkan `dragId` relatif terhadap `targetId`. Urutan saudara dinomori ulang. */
export function moveItem<T extends Sortable>(
  rows: readonly T[],
  dragId: string,
  targetId: string,
  position: DropPosition,
): MoveResult<T> {
  if (dragId === targetId) return { rows: null, error: "Item tidak bisa dipindah ke dirinya sendiri." };
  const drag = rows.find((r) => r.id === dragId);
  const target = rows.find((r) => r.id === targetId);
  if (!drag || !target) return { rows: null, error: "Item menu tidak ditemukan." };

  const newParentId = position === "inside" ? target.id : target.parentId;
  const error = validateParent(rows, dragId, newParentId);
  if (error) return { rows: null, error };

  const detached = rows.map((r) => (r.id === dragId ? { ...r, parentId: newParentId } : r));
  // Saudara lama dirapikan agar tidak ada celah urutan.
  let next = withOrder(detached, drag.parentId, siblingsOf(detached, drag.parentId).filter((r) => r.id !== dragId));

  const siblings = siblingsOf(next, newParentId).filter((r) => r.id !== dragId);
  const moved = next.find((r) => r.id === dragId)!;
  let index = siblings.length;
  if (position !== "inside") {
    const targetIndex = siblings.findIndex((r) => r.id === targetId);
    index = position === "before" ? targetIndex : targetIndex + 1;
  }
  siblings.splice(index, 0, moved);
  next = withOrder(next, newParentId, siblings);
  return { rows: next, error: null };
}

/** Tukar posisi dengan saudara sebelum (-1) atau sesudah (+1). */
export function moveSibling<T extends Sortable>(rows: readonly T[], id: string, direction: -1 | 1): T[] {
  const item = rows.find((r) => r.id === id);
  if (!item) return [...rows];
  const siblings = siblingsOf(rows, item.parentId);
  const index = siblings.findIndex((r) => r.id === id);
  const swap = index + direction;
  if (swap < 0 || swap >= siblings.length) return [...rows];
  [siblings[index], siblings[swap]] = [siblings[swap], siblings[index]];
  return withOrder(rows, item.parentId, siblings);
}