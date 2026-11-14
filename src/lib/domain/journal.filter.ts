/** Filter daftar publik journal — lihat `journal.ts`. */
import { JOURNAL_BASE_PATH } from "./journal.constants.ts";
import { normalizeLabel } from "./journal.taxonomy.ts";

export type JournalFilter = { category?: string; tag?: string };

const FILTER_VALUE_MAX = 80;

function filterValue(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return undefined;
  const label = normalizeLabel(raw).slice(0, FILTER_VALUE_MAX);
  return label || undefined;
}

/** Filter dari query string halaman daftar (`?category=…&tag=…`). */
export function parseJournalFilter(params: {
  category?: string | string[];
  tag?: string | string[];
}): JournalFilter {
  const category = filterValue(params.category);
  const tag = filterValue(filterValue(params.tag)?.replace(/^#+/, ""))?.toLowerCase();
  return { ...(category ? { category } : {}), ...(tag ? { tag } : {}) };
}

/** Saring artikel per kategori/tag (tanpa membedakan huruf besar/kecil). */
export function filterJournalPosts<T extends { category: string | null; tags: string[] }>(
  posts: readonly T[],
  filter: JournalFilter = {},
): T[] {
  const category = filter.category?.toLowerCase();
  const tag = filter.tag?.toLowerCase();
  return posts.filter(
    (post) =>
      (!category || (post.category ?? "").toLowerCase() === category) &&
      (!tag || post.tags.some((t) => t.toLowerCase() === tag)),
  );
}

/** Kategori unik, urut sesuai kemunculan pertama (artikel terbaru dulu). */
export function collectJournalCategories(
  posts: readonly { category: string | null }[],
): string[] {
  const seen = new Map<string, string>();
  for (const post of posts) {
    const label = normalizeLabel(post.category ?? "");
    if (label && !seen.has(label.toLowerCase())) seen.set(label.toLowerCase(), label);
  }
  return [...seen.values()];
}

/**
 * Kategori untuk chip filter: urutan `ordered` (sortOrder dari admin) yang
 * dipakai, dibatasi pada kategori yang benar-benar punya artikel terlihat.
 * Kategori yang masih menempel di artikel tapi tidak ada di daftar admin —
 * misalnya karena baru dihapus — tetap muncul di belakang supaya artikelnya
 * tidak kehilangan filter.
 */
export function orderJournalCategories(
  ordered: readonly string[],
  used: readonly string[],
): string[] {
  const usedByKey = new Map(used.map((name) => [name.toLowerCase(), name]));
  const result: string[] = [];
  for (const name of ordered) {
    const match = usedByKey.get(name.toLowerCase());
    if (!match) continue;
    result.push(name);
    usedByKey.delete(name.toLowerCase());
  }
  return [...result, ...usedByKey.values()];
}

/** Tag unik, paling sering dipakai dulu, lalu urut abjad. */
export function collectJournalTags(posts: readonly { tags: string[] }[]): string[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of new Set(post.tags.map((t) => t.toLowerCase()))) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "id"))
    .map(([tag]) => tag);
}

/** URL daftar artikel dengan filter (dipakai tautan kategori/tag). */
export function journalListHref(filter: JournalFilter = {}): string {
  const params = new URLSearchParams();
  if (filter.category) params.set("category", filter.category);
  if (filter.tag) params.set("tag", filter.tag);
  const query = params.toString();
  return query ? `${JOURNAL_BASE_PATH}?${query}` : JOURNAL_BASE_PATH;
}