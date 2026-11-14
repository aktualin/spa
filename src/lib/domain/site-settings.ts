/**
 * Aturan modul Kontak & Umum (`SiteSettings`): pembacaan baris database,
 * normalisasi & validasi isian admin, serta penerapan pengaturan ke kartu
 * lokasi dan ikon sosial di footer.
 *
 * Tanpa nilai bawaan statis: kolom yang belum diisi admin dikembalikan kosong
 * supaya halaman publik menampilkan empty state, bukan alamat atau nomor
 * hardcode yang diam-diam menimpa data admin.
 *
 * Modul murni (tanpa I/O, tanpa Next/Prisma) supaya bisa diuji langsung
 * dengan `node --test`. Implementasinya dipecah ke berkas `site-settings.*.ts`
 * di folder ini; berkas ini hanya mengekspor ulang simbol publiknya.
 */

export type { SiteSettings } from "./site-settings.types.ts";
export type { SiteSettingsRow, SiteSettingsWrite } from "./site-settings.row.ts";
export { emptySiteSettings } from "./site-settings.empty.ts";
export {
  normalizeWhatsAppNumber,
  formatPhoneDisplay,
  isValidPhone,
} from "./site-settings.phone.ts";
export {
  type SocialPlatform,
  isHttpsUrl,
  isPlatformUrl,
  normalizeInstagramUsername,
  instagramUsernameFromUrl,
} from "./site-settings.social.ts";
export { parseMapsEmbedInput, directionsUrl } from "./site-settings.maps.ts";
export {
  normalizeGa4Id,
  MAX_OPENING_HOURS,
  MAX_OPENING_HOURS_LENGTH,
  normalizeOpeningHours,
  normalizeMenuScanUrls,
} from "./site-settings.normalize.ts";
export {
  type SiteSettingsInput,
  MAX_FOOTER_TAGLINE,
  MAX_FOOTER_MEMBERSHIP_TITLE,
  MAX_FOOTER_MEMBERSHIP_LABEL,
  MAX_PARTNERSHIP_INTRO,
  MAX_PRICE_DISCLAIMER,
  MAX_BOOK_NOW_LABEL,
  MAX_MENU_SCANS,
} from "./site-settings.input.ts";
export {
  siteSettingsInputSchema,
  type SiteSettingsParsed,
} from "./site-settings.schema.ts";
export { toSiteSettingsWrite } from "./site-settings.write.ts";
export { mergeSiteSettings } from "./site-settings.merge.ts";
export {
  type FormDefaults,
  siteSettingsFormDefaults,
} from "./site-settings.form-defaults.ts";
export {
  FLAGSHIP_LOCATION_SLUG,
  type FooterSocial,
  footerSocials,
} from "./site-settings.footer.ts";