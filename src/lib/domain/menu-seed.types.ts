/** Tipe & helper isi awal MenuItem — lihat `menu-seed.ts`. */
import type { NavLink, NavMegaGroup } from "../../data/content.ts";
import type { MenuLinkType, MenuLocation } from "./menu.ts";

/** Kartu highlight mega menu (highlights[0] grup) — null bila tidak ada. */
export type MenuHighlightSeed = {
  highlightImageUrl: string | null;
  highlightLabel: string | null;
  highlightHref: string | null;
  highlightBadge: string | null;
  highlightEyebrow: string | null;
};

export type MenuSeedItem = MenuHighlightSeed & {
  key: string;
  parentKey: string | null;
  label: string;
  linkType: MenuLinkType;
  url: string | null;
  sortOrder: number;
  openInNew: boolean;
  locations: MenuLocation[];
  panelKey: string | null;
  panelLinkLabel: string | null;
};

export const NO_HIGHLIGHT: MenuHighlightSeed = {
  highlightImageUrl: null,
  highlightLabel: null,
  highlightHref: null,
  highlightBadge: null,
  highlightEyebrow: null,
};

export function highlightSeed(group: NavMegaGroup | undefined): MenuHighlightSeed {
  const highlight = group?.highlights[0];
  if (!highlight) return NO_HIGHLIGHT;
  return {
    highlightImageUrl: highlight.image,
    highlightLabel: highlight.label,
    highlightHref: highlight.href,
    highlightBadge: highlight.badge ?? null,
    highlightEyebrow: highlight.eyebrow ?? null,
  };
}

export function linkTypeForHref(href: string): MenuLinkType {
  if (/^(https?:|mailto:|tel:)/i.test(href)) return "EXTERNAL_URL";
  if (href.includes("#")) return "ANCHOR";
  return "INTERNAL_URL";
}

export const HEADER_LOCATIONS: MenuLocation[] = ["HEADER", "MOBILE"];
export const FOOTER_LOCATIONS: MenuLocation[] = ["FOOTER"];

export function leaf(key: string, parentKey: string, link: NavLink, sortOrder: number): MenuSeedItem {
  return {
    key,
    parentKey,
    label: link.label,
    linkType: linkTypeForHref(link.href),
    url: link.href,
    sortOrder,
    openInNew: link.external === true,
    locations: HEADER_LOCATIONS,
    panelKey: null,
    panelLinkLabel: null,
    ...NO_HIGHLIGHT,
  };
}