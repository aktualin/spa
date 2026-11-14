/** Slug & URL artikel journal — lihat `journal.ts`. */
import { JOURNAL_BASE_PATH, JOURNAL_SLUG_MAX } from "./journal.constants.ts";
import { SLUG_PATTERN, slugify } from "./slug.ts";

/** Path publik satu artikel. */
export function journalPath(slug: string): string {
  return `${JOURNAL_BASE_PATH}/${slug}`;
}

/** Pesan galat slug artikel, atau null bila boleh dipakai. */
export function validateJournalSlug(slug: string): string | null {
  if (slug.length === 0) {
    return "Slug tidak bisa dibuat otomatis dari judul ini. Isi slug secara manual.";
  }
  if (slug.length > JOURNAL_SLUG_MAX) {
    return `Slug maksimal ${JOURNAL_SLUG_MAX} karakter.`;
  }
  if (!SLUG_PATTERN.test(slug)) {
    return "Slug hanya boleh huruf kecil, angka, dan tanda hubung (tidak di awal/akhir, tidak ganda).";
  }
  return null;
}

/** Slug dari isian form: kosong → dibuat dari judul (dipotong rapi di batas). */
export function resolveJournalSlug(rawSlug: string, title: string): string {
  const slug = rawSlug.trim();
  if (slug) return slug;
  return slugify(title).slice(0, JOURNAL_SLUG_MAX).replace(/-+$/, "");
}