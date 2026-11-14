/**
 * Aturan modul Journal: slug & URL artikel, normalisasi kategori/tag,
 * penjadwalan publikasi, panjang meta SEO, dan filter daftar publik.
 *
 * Modul murni (tanpa Prisma/Next) supaya bisa dipakai admin, proxy, halaman
 * publik, dan diuji langsung dengan `node --test`.
 *
 * ATURAN PENJADWALAN (dievaluasi terhadap waktu sekarang):
 * - Draf                : tidak pernah tampil; tanggal publikasi boleh diisi
 *                         sebagai rencana dan disimpan apa adanya.
 * - Terbit / Terjadwal  : status disimpan sesuai tanggalnya —
 *     tanggal di masa depan  → SCHEDULED (tampil otomatis saat waktunya tiba),
 *     tanggal sudah lewat    → PUBLISHED,
 *     tanggal kosong         → Terbit memakai waktu sekarang; Terjadwal ditolak.
 * Artikel SCHEDULED yang waktunya sudah lewat tetap tampil tanpa perlu
 * disimpan ulang (lihat `isJournalVisible`).
 *
 * Implementasinya dipecah ke berkas `journal.*.ts` di folder ini; berkas ini
 * hanya mengekspor ulang simbol publiknya.
 */

export {
  type JournalStatusValue,
  JOURNAL_BASE_PATH,
  JOURNAL_SLUG_MAX,
  JOURNAL_TITLE_MAX,
  JOURNAL_EXCERPT_MAX,
  JOURNAL_CATEGORY_MAX,
  JOURNAL_TAG_MAX,
  JOURNAL_TAGS_PER_POST,
  JOURNAL_SEO_TITLE_IDEAL,
  JOURNAL_SEO_DESCRIPTION_IDEAL,
  JOURNAL_SEO_TITLE_MAX,
  JOURNAL_SEO_DESCRIPTION_MAX,
} from "./journal.constants.ts";
export { journalPath, validateJournalSlug, resolveJournalSlug } from "./journal.slug.ts";
export {
  normalizeLabel,
  normalizeJournalCategory,
  type TagParseResult,
  parseJournalTags,
} from "./journal.taxonomy.ts";
export {
  type ScheduleResult,
  resolveJournalSchedule,
  effectiveJournalStatus,
} from "./journal.schedule.ts";
export { isRichTextEmpty, type SeoLengthState, seoLengthState } from "./journal.text.ts";
export {
  type JournalFilter,
  parseJournalFilter,
  filterJournalPosts,
  collectJournalCategories,
  orderJournalCategories,
  collectJournalTags,
  journalListHref,
} from "./journal.filter.ts";