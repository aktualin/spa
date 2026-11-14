/** Kategori & tag artikel journal — lihat `journal.ts`. */
import { JOURNAL_TAG_MAX, JOURNAL_TAGS_PER_POST } from "./journal.constants.ts";
import { collapseSpaces } from "./text.ts";

/** Rapikan label bebas: buang spasi di tepi dan spasi ganda. */
export function normalizeLabel(value: string): string {
  return collapseSpaces(value);
}

/**
 * Kategori artikel. Bila sama (tanpa membedakan huruf besar/kecil) dengan
 * kategori yang sudah ada, ejaan yang sudah ada dipakai supaya filter publik
 * tidak pecah menjadi "Wellness" dan "wellness".
 */
export function normalizeJournalCategory(
  value: string | null | undefined,
  existing: readonly string[] = [],
): string | null {
  const label = normalizeLabel(value ?? "");
  if (!label) return null;
  const match = existing.find(
    (category) => normalizeLabel(category).toLowerCase() === label.toLowerCase(),
  );
  return match ? normalizeLabel(match) : label;
}

export type TagParseResult = { tags: string[]; error: string | null };

/**
 * Tag dari satu input teks (dipisah koma atau baris baru): huruf kecil, tanpa
 * "#" di depan, spasi dirapikan, tanpa duplikat, urutan isian dipertahankan.
 */
export function parseJournalTags(raw: string | readonly string[]): TagParseResult {
  const parts = typeof raw === "string" ? raw.split(/[,\n]/) : raw;
  const tags: string[] = [];
  const seen = new Set<string>();

  for (const part of parts) {
    const tag = normalizeLabel(normalizeLabel(part).replace(/^#+/, "")).toLowerCase();
    if (!tag || seen.has(tag)) continue;
    if (tag.length > JOURNAL_TAG_MAX) {
      return { tags, error: `Tag "${tag}" terlalu panjang (maksimal ${JOURNAL_TAG_MAX} karakter).` };
    }
    seen.add(tag);
    tags.push(tag);
  }

  if (tags.length > JOURNAL_TAGS_PER_POST) {
    return {
      tags: tags.slice(0, JOURNAL_TAGS_PER_POST),
      error: `Maksimal ${JOURNAL_TAGS_PER_POST} tag per artikel.`,
    };
  }
  return { tags, error: null };
}