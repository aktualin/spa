/**
 * Menerjemahkan pohon menu (DB) ke bentuk data yang sudah dibaca komponen
 * header & footer (`nav`, `footerLinks` di src/data/content.ts), supaya
 * markup frontend tidak berubah sama sekali.
 *
 * Peta: level 1 = item bar atas; level 1 yang punya anak membuka mega panel;
 * level 2 yang punya anak = kolom berjudul; level 3 = tautan di kolom.
 * Level 2 tanpa anak dikumpulkan ke kolom tanpa judul.
 */

import type {
  NavHighlight,
  NavLink,
  NavMegaGroup,
  NavPrimaryItem,
} from "../../data/content.ts";
import type { MenuNode } from "./menu.ts";

export type NavData = {
  primary: NavPrimaryItem[];
  megaGroups: Record<string, NavMegaGroup>;
};

/** Preset tampilan mega panel per `panelKey` (lebar panel + kartu highlight). */
export type PanelPresets = Record<
  string,
  { panel: NavMegaGroup["panel"]; highlights: NavHighlight[] }
>;

function toLink(node: MenuNode): NavLink | null {
  if (!node.href) return null;
  return node.openInNew
    ? { label: node.label, href: node.href, external: true }
    : { label: node.label, href: node.href };
}

function linksOf(nodes: MenuNode[]): NavLink[] {
  return nodes.map(toLink).filter((link): link is NavLink => link !== null);
}

export function menuTreeToNav(tree: MenuNode[], presets: PanelPresets): NavData {
  const primary: NavPrimaryItem[] = [];
  const megaGroups: Record<string, NavMegaGroup> = {};

  for (const root of tree) {
    if (root.children.length === 0) {
      if (!root.href) continue;
      primary.push(
        root.openInNew
          ? { label: root.label, href: root.href, external: true }
          : { label: root.label, href: root.href },
      );
      continue;
    }

    const columns: NavMegaGroup["columns"] = [];
    let loose: NavLink[] | null = null;
    for (const child of root.children) {
      if (child.children.length > 0) {
        loose = null;
        columns.push({ title: child.label, links: linksOf(child.children) });
      } else {
        const link = toLink(child);
        if (!link) continue;
        if (!loose) {
          loose = [];
          columns.push({ title: "", links: loose });
        }
        loose.push(link);
      }
    }

    const key = root.panelKey || `menu-${root.id}`;
    const preset = presets[key];
    const group: NavMegaGroup = {
      id: key,
      label: root.label,
      panel: preset?.panel ?? (columns.length > 1 ? "wide" : "narrow"),
      columns,
      highlights: preset?.highlights ?? [],
    };
    if (root.panelLinkLabel && root.href) {
      group.footerLink = { label: root.panelLinkLabel, href: root.href };
    }

    megaGroups[key] = group;
    primary.push({ label: root.label, href: root.href ?? "#", mega: key });
  }

  return { primary, megaGroups };
}

/** Footer: setiap item level 1 = satu grup; anak & cucu = daftar tautannya. */
export function menuTreeToFooter(tree: MenuNode[]): Record<string, NavLink[]> {
  const groups: Record<string, NavLink[]> = {};
  for (const root of tree) {
    const flattened = root.children.flatMap((child) =>
      child.children.length > 0 ? [child, ...child.children] : [child],
    );
    const links = linksOf(flattened);
    if (links.length > 0) groups[root.label] = links;
  }
  return groups;
}

export function presetsFromMegaGroups(groups: Record<string, NavMegaGroup>): PanelPresets {
  return Object.fromEntries(
    Object.entries(groups).map(([key, group]) => [
      key,
      { panel: group.panel, highlights: group.highlights },
    ]),
  );
}
