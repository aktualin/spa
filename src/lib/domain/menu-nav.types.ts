/** Tipe terjemahan pohon menu ke data nav — lihat `menu-nav.ts`. */
import type {
  NavHighlight,
  NavMegaGroup,
  NavPrimaryItem,
} from "../../data/content.ts";

export type NavData = {
  primary: NavPrimaryItem[];
  megaGroups: Record<string, NavMegaGroup>;
};

/**
 * Tampilan mega panel per `panelKey` (lebar panel + kartu highlight), diisi
 * admin lewat modul Menu. `panel` kosong → lebar ditentukan dari jumlah kolom.
 */
export type PanelPresets = Record<
  string,
  { panel?: NavMegaGroup["panel"]; highlights: NavHighlight[] }
>;

/** Baris menu level 1 yang menyimpan tampilan panelnya. */
export type PanelPresetRow = {
  id: string;
  parentId: string | null;
  panelKey: string | null;
  panelWidth: number | null;
  highlightImageUrl: string | null;
  highlightLabel: string | null;
  highlightHref: string | null;
  highlightBadge: string | null;
  highlightEyebrow: string | null;
};

/**
 * Kunci panel yang dipakai `menuTreeToNav` untuk sebuah item level 1.
 * Disamakan di dua tempat supaya preset selalu ketemu grupnya.
 */
export function panelKeyOf(row: { id: string; panelKey: string | null }): string {
  return row.panelKey || `menu-${row.id}`;
}