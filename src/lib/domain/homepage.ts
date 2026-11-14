/**
 * Aturan homepage di luar banner: section yang tampil secara bawaan, dan
 * kartu highlight (`HomepageHighlight`) di section "What's New".
 *
 * Modul murni (tanpa I/O) supaya bisa diuji langsung dengan `node --test`.
 * Implementasinya dipecah ke berkas `homepage.*.ts` di folder ini; berkas
 * ini hanya mengekspor ulang simbol publiknya.
 *
 * ## Kartu highlight & fallback statis
 *
 * Section "What's New" menampilkan kartu highlight dari database dengan
 * markup yang sama persis dengan kartu statis lama (`journalPosts` di
 * `src/data/content.ts`). Kartu statis HANYA dipakai bila tabel highlight
 * masih kosong (belum pernah diisi admin). Begitu ada satu baris saja, yang
 * tampil adalah highlight yang lolos `isHighlightVisible` — meskipun hasilnya
 * nol (mis. semua masih draf) — supaya draf tidak memunculkan kembali konten
 * lama secara diam-diam.
 *
 * Statistik, ulasan, dan feed Instagram memakai pola fallback yang sama:
 * tabel KOSONG (belum pernah diisi) → pemanggil memakai data statis lama;
 * ada baris tetapi tak satu pun terbit → section tampil tanpa item.
 */

export {
  DEFAULT_VISIBLE_SECTION_KEYS,
  isDefaultVisibleSection,
  FIXED_POSITION_SECTION_KEYS,
  isFixedPositionSection,
  isToggleOnlySection,
} from "./homepage.sections.ts";
export {
  HIGHLIGHT_LIMITS,
  type HighlightCard,
  type HighlightRowLike,
  isHighlightVisible,
  type HighlightStatus,
  highlightStatus,
  highlightToCard,
  selectHighlightCards,
} from "./homepage.highlights.ts";
export {
  type HighlightRawInput,
  type HighlightData,
  type HighlightValidation,
  validateHighlightInput,
} from "./homepage.highlight-input.ts";
export { reorderIds } from "./homepage.reorder.ts";
export { type SimpleValidation } from "./homepage.shared.ts";
export {
  STAT_LIMITS,
  type StatItem,
  type StatRowLike,
  selectStats,
  countPublished,
  type StatRawInput,
  type StatData,
  validateStatInput,
} from "./homepage.stats.ts";
export {
  REVIEW_LIMITS,
  type ReviewItem,
  type ReviewRowLike,
  selectReviews,
  type ReviewRawInput,
  type ReviewData,
  validateReviewInput,
} from "./homepage.reviews.ts";
export {
  INSTAGRAM_LIMITS,
  type InstagramItem,
  type InstagramRowLike,
  selectInstagramPosts,
  type InstagramRawInput,
  type InstagramData,
  validateInstagramInput,
} from "./homepage.instagram.ts";