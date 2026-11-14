/** Pewarisan lokasi saat item naik ke level 1 — lihat `menu.ts`. */
import { type Link, parentMap } from "./menu.tree.ts";
import type { MenuLocation } from "./menu.types.ts";

const DEFAULT_ROOT_LOCATIONS: MenuLocation[] = ["HEADER", "MOBILE"];

export type Located = Link & { locations: MenuLocation[] };

/**
 * Anak tidak menyimpan lokasi. Bila sebuah anak naik menjadi level 1, ia
 * mewarisi lokasi akar lamanya supaya tidak hilang dari semua lokasi.
 */
export function inheritRootLocations<T extends Located>(
  before: readonly Located[],
  after: readonly T[],
): T[] {
  const rootLocationsBefore = (id: string): MenuLocation[] => {
    const parents = parentMap(before);
    let current = id;
    const seen = new Set<string>();
    while (!seen.has(current)) {
      seen.add(current);
      const parent = parents.get(current) ?? null;
      if (parent === null) break;
      current = parent;
    }
    const root = before.find((r) => r.id === current);
    return root && root.locations.length > 0 ? root.locations : DEFAULT_ROOT_LOCATIONS;
  };

  return after.map((row) =>
    row.parentId === null && row.locations.length === 0
      ? { ...row, locations: [...rootLocationsBefore(row.id)] }
      : row,
  );
}