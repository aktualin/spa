/**
 * Menerjemahkan pohon menu (DB) ke bentuk data yang sudah dibaca komponen
 * header & footer (`nav`, `footerLinks` di src/data/content.ts), supaya
 * markup frontend tidak berubah sama sekali.
 *
 * Peta: level 1 = item bar atas; level 1 yang punya anak membuka mega panel;
 * level 2 yang punya anak = kolom berjudul; level 3 = tautan di kolom.
 * Level 2 tanpa anak dikumpulkan ke kolom tanpa judul.
 *
 * Implementasinya dipecah ke berkas `menu-nav.*.ts` di folder ini; berkas ini
 * hanya mengekspor ulang simbol publiknya.
 */

export type { NavData, PanelPresets, PanelPresetRow } from "./menu-nav.types.ts";
export {
  panelPresetsFromRows,
  presetsFromMegaGroups,
} from "./menu-nav.presets.ts";
export { menuTreeToNav, menuTreeToFooter } from "./menu-nav.convert.ts";