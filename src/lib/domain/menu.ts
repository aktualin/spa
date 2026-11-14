/**
 * Aturan menu navigasi: validasi tautan & struktur, perpindahan item, dan
 * pembentukan pohon per lokasi. Murni — dipakai Server Action, halaman admin
 * (pratinjau di browser), pembaca konten publik, dan unit test.
 * Implementasinya dipecah ke berkas `menu.*.ts` di folder ini; berkas ini
 * hanya mengekspor ulang simbol publiknya.
 */

export {
  MAX_MENU_DEPTH,
  MAX_MENU_LABEL_LENGTH,
  MENU_LINK_TYPES,
  type MenuLinkType,
  MENU_LOCATIONS,
  type MenuLocation,
  type MenuRow,
  type MenuNode,
} from "./menu.types.ts";
export {
  validateMenuLink,
  validateMenuLabel,
  resolveMenuHref,
  isBrokenMenuLink,
} from "./menu.link.ts";
export {
  depthOf,
  subtreeHeight,
  validateParent,
  validateStructure,
  canAddChild,
} from "./menu.tree.ts";
export {
  siblingsOf,
  type DropPosition,
  type MoveResult,
  moveItem,
  moveSibling,
} from "./menu.move.ts";
export { inheritRootLocations } from "./menu.locations.ts";
export { buildMenuTree } from "./menu.public-tree.ts";