/**
 * Isi awal tabel MenuItem, disusun dari menu statis yang selama ini tampil
 * (`nav` & `footerLinks`). Unit test memastikan hasilnya, setelah dibaca balik
 * lewat buildMenuTree + menuTreeToNav, identik dengan data statis — jadi
 * memindah menu ke database tidak mengubah tampilan sama sekali.
 */

import type { NavLink, NavMegaGroup, NavPrimaryItem } from "../../data/content.ts";
import {
  FOOTER_LOCATIONS,
  HEADER_LOCATIONS,
  type MenuSeedItem,
  NO_HIGHLIGHT,
  highlightSeed,
  leaf,
  linkTypeForHref,
} from "./menu-seed.types.ts";

export type { MenuHighlightSeed, MenuSeedItem } from "./menu-seed.types.ts";
export { linkTypeForHref } from "./menu-seed.types.ts";

export function buildStaticMenuSeed(
  nav: { primary: NavPrimaryItem[]; megaGroups: Record<string, NavMegaGroup> },
  footerLinks: Record<string, NavLink[]>,
): MenuSeedItem[] {
  const items: MenuSeedItem[] = [];

  nav.primary.forEach((item, index) => {
    const key = `header-${index}`;
    const group = item.mega ? nav.megaGroups[item.mega] : undefined;
    items.push({
      key,
      parentKey: null,
      label: item.label,
      linkType: linkTypeForHref(item.href),
      url: item.href,
      sortOrder: index,
      openInNew: item.external === true,
      locations: HEADER_LOCATIONS,
      panelKey: item.mega ?? null,
      panelLinkLabel: group?.footerLink?.label ?? null,
      ...highlightSeed(group),
    });
    if (!group) return;

    group.columns.forEach((column, colIndex) => {
      const colKey = `${key}-col-${colIndex}`;
      items.push({
        key: colKey,
        parentKey: key,
        label: column.title,
        linkType: "NO_LINK",
        url: null,
        sortOrder: colIndex,
        openInNew: false,
        locations: HEADER_LOCATIONS,
        panelKey: null,
        panelLinkLabel: null,
        ...NO_HIGHLIGHT,
      });
      column.links.forEach((link, linkIndex) => {
        items.push(leaf(`${colKey}-${linkIndex}`, colKey, link, linkIndex));
      });
    });
  });

  Object.entries(footerLinks).forEach(([groupLabel, links], index) => {
    const key = `footer-${index}`;
    items.push({
      key,
      parentKey: null,
      label: groupLabel,
      linkType: "NO_LINK",
      url: null,
      // Setelah item header supaya urutan di admin tetap rapi.
      sortOrder: nav.primary.length + index,
      openInNew: false,
      locations: FOOTER_LOCATIONS,
      panelKey: null,
      panelLinkLabel: null,
      ...NO_HIGHLIGHT,
    });
    links.forEach((link, linkIndex) => {
      items.push({ ...leaf(`${key}-${linkIndex}`, key, link, linkIndex), locations: FOOTER_LOCATIONS });
    });
  });

  return items;
}