/**
 * Aturan banner/hero homepage (section `hero`, `membership-banner`,
 * `booking-banner`).
 *
 * Modul murni (tanpa I/O) supaya bisa diuji langsung dengan `node --test`.
 * Dipakai di dua sisi:
 *
 * - Server Action admin: `validateBannerInput` memvalidasi isian form.
 * - Homepage publik: `resolveBanner` menggabungkan isian admin dengan nilai
 *   bawaan (hardcode lama). Field kosong/null → nilai bawaan, sehingga
 *   tampilan default identik dengan sebelum fitur ini ada.
 *
 * ## Aturan judul (PENTING)
 *
 * Kolom `title` di DB sejak awal berisi LABEL ADMIN ("Hero",
 * "Membership Banner", "Booking Banner", dsb. — dari seed dan dari tombol
 * "Tambahkan section"). Label itu tidak boleh muncul sebagai H1/H2 di situs.
 * Karena itu `title` hanya dipakai sebagai judul tampil bila isinya BUKAN
 * salah satu label bawaan section tersebut (lihat `isPlaceholderTitle`).
 * Mengosongkan judul di form admin menyimpan kembali label bawaan, sehingga
 * frontend kembali memakai teks hardcode. Konsekuensinya, menjalankan ulang
 * seed (yang menimpa `title` dengan label) mengembalikan judul ke teks bawaan
 * — aman, tidak pernah menampilkan label admin.
 *
 * Implementasinya dipecah ke berkas `homepage-banner.*.ts` di folder ini;
 * berkas ini hanya mengekspor ulang simbol publiknya.
 */

export {
  BANNER_KEYS,
  type BannerKey,
  isBannerKey,
  BANNER_LIMITS,
  type BannerFieldConfig,
  BANNER_FIELDS,
  BANNER_DEFAULT_TITLE,
} from "./homepage-banner.config.ts";
export { isPlaceholderTitle, displayTitle } from "./homepage-banner.title.ts";
export { isSafeCtaHref, isSafeImageUrl } from "./homepage-banner.url.ts";
export {
  type BannerRawInput,
  type BannerData,
  type BannerValidation,
  validateBannerInput,
} from "./homepage-banner.validate.ts";
export {
  type BannerSectionLike,
  type BannerDefaults,
  type ResolvedBanner,
  resolveBanner,
  HERO_DEFAULTS,
  BOOKING_BANNER_DEFAULTS,
  MOBILE_MEDIA_QUERY,
} from "./homepage-banner.resolve.ts";