/** Preset mega panel dari baris menu — lihat `menu-nav.ts`. */
import type { NavHighlight, NavMegaGroup } from "../../data/content.ts";
import {
  type PanelPresetRow,
  type PanelPresets,
  panelKeyOf,
} from "./menu-nav.types.ts";

/**
 * Preset panel dari baris menu. Kartu highlight hanya dibuat bila gambar,
 * label, dan tujuannya terisi — sebagian terisi dianggap belum siap tampil.
 */
export function panelPresetsFromRows(rows: readonly PanelPresetRow[]): PanelPresets {
  const presets: PanelPresets = {};
  for (const row of rows) {
    if (row.parentId !== null) continue;

    const highlights: NavHighlight[] =
      row.highlightImageUrl && row.highlightLabel && row.highlightHref
        ? [
            {
              image: row.highlightImageUrl,
              label: row.highlightLabel,
              href: row.highlightHref,
              badge: row.highlightBadge ?? undefined,
              eyebrow: row.highlightEyebrow ?? undefined,
            },
          ]
        : [];

    const panel =
      row.panelWidth === null ? undefined : row.panelWidth >= 2 ? "wide" : "narrow";

    if (highlights.length === 0 && panel === undefined) continue;
    presets[panelKeyOf(row)] = { panel, highlights };
  }
  return presets;
}

/**
 * Preset dari bentuk nav lama. Hanya dipakai pengujian untuk memastikan
 * `menuTreeToNav` masih menghasilkan struktur yang sama seperti desain awal.
 */
export function presetsFromMegaGroups(groups: Record<string, NavMegaGroup>): PanelPresets {
  return Object.fromEntries(
    Object.entries(groups).map(([key, group]) => [
      key,
      { panel: group.panel, highlights: group.highlights },
    ]),
  );
}