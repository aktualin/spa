/** Pohon menu publik per lokasi — lihat `menu.ts`. */
import { isBrokenMenuLink, resolveMenuHref } from "./menu.link.ts";
import { siblingsOf } from "./menu.move.ts";
import { MAX_MENU_DEPTH, type MenuLocation, type MenuNode, type MenuRow } from "./menu.types.ts";

/**
 * Pohon menu untuk satu lokasi. Lokasi dibaca dari item level 1; anak
 * mengikuti induk. Item tersembunyi dan tautan halaman yang hilang dibuang
 * beserta sub-menunya, sehingga tidak ada tautan rusak di situs.
 */
export function buildMenuTree(rows: readonly MenuRow[], location: MenuLocation): MenuNode[] {
  const build = (parentId: string | null, depth: number): MenuNode[] => {
    if (depth > MAX_MENU_DEPTH) return [];
    return siblingsOf(rows, parentId)
      .filter((row) => row.isVisible && !isBrokenMenuLink(row))
      .filter((row) => parentId !== null || row.locations.includes(location))
      .map((row) => ({
        id: row.id,
        label: row.label,
        href: resolveMenuHref(row),
        openInNew: row.openInNew,
        panelKey: row.panelKey,
        panelLinkLabel: row.panelLinkLabel,
        children: build(row.id, depth + 1),
      }));
  };
  return build(null, 1);
}