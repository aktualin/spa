/** Tipe menu navigasi — lihat `menu.ts`. */

export const MAX_MENU_DEPTH = 3;
export const MAX_MENU_LABEL_LENGTH = 60;

export const MENU_LINK_TYPES = [
  "PAGE",
  "INTERNAL_URL",
  "EXTERNAL_URL",
  "ANCHOR",
  "NO_LINK",
] as const;
export type MenuLinkType = (typeof MENU_LINK_TYPES)[number];

export const MENU_LOCATIONS = ["HEADER", "MOBILE", "FOOTER"] as const;
export type MenuLocation = (typeof MENU_LOCATIONS)[number];

export type MenuRow = {
  id: string;
  parentId: string | null;
  label: string;
  linkType: MenuLinkType;
  url: string | null;
  pageId: string | null;
  /** Halaman tujuan untuk PAGE; null bila halaman sudah dihapus. */
  page: { slug: string; published: boolean } | null;
  sortOrder: number;
  isVisible: boolean;
  openInNew: boolean;
  locations: MenuLocation[];
  panelKey: string | null;
  panelLinkLabel: string | null;
};

export type MenuNode = {
  id: string;
  label: string;
  /** null untuk NO_LINK. */
  href: string | null;
  openInNew: boolean;
  panelKey: string | null;
  panelLinkLabel: string | null;
  children: MenuNode[];
};