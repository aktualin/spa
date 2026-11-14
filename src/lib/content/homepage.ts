/**
 * Bacaan publik section homepage (`HomepageSection`).
 *
 * Admin dapat menonaktifkan dan mengurutkan tiap section dari dashboard.
 * Section yang tidak ada di DB tetap dirender dengan urutan bawaan, kecuali
 * section BARU (signature-treatments, promo-highlight, gallery-teaser) —
 * section baru hanya tampil bila barisnya ada di DB dengan `isEnabled = true`.
 *
 * Section `footer` hanya berupa saklar tampil/sembunyi footer DI HOMEPAGE
 * (halaman lain selalu menampilkan footer). Tanpa baris DB → tampil.
 *
 * Kartu highlight "What's New" (`HomepageHighlight`) dibaca lewat
 * `getWhatsNewCards`.
 *
 * Implementasinya dipecah ke berkas `homepage.*.ts` di folder ini; berkas ini
 * hanya mengekspor ulang simbol publiknya.
 */

export type {
  HomepageSectionKey,
  HomepageSection,
  HeroSlideRow,
} from "./homepage.types";
export { getHomepageSections } from "./homepage.sections";
export { getHeroSlides, getWhatsNewCards } from "./homepage.media";
export {
  getHomepageStats,
  getHomepageReviews,
  getInstagramPosts,
} from "./homepage.stats";