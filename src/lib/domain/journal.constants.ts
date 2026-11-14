/** Konstanta modul Journal — lihat `journal.ts`. */

export type JournalStatusValue = "DRAFT" | "SCHEDULED" | "PUBLISHED";

/** Path daftar artikel publik. */
export const JOURNAL_BASE_PATH = "/our-story/journal";

export const JOURNAL_SLUG_MAX = 80;
export const JOURNAL_TITLE_MAX = 160;
export const JOURNAL_EXCERPT_MAX = 400;
export const JOURNAL_CATEGORY_MAX = 50;
export const JOURNAL_TAG_MAX = 40;
export const JOURNAL_TAGS_PER_POST = 20;

/** Panjang ideal meta SEO (patokan umum hasil pencarian Google). */
export const JOURNAL_SEO_TITLE_IDEAL = 60;
export const JOURNAL_SEO_DESCRIPTION_IDEAL = 160;
/** Batas keras — di atas ini teks pasti terpotong di hasil pencarian. */
export const JOURNAL_SEO_TITLE_MAX = 120;
export const JOURNAL_SEO_DESCRIPTION_MAX = 320;