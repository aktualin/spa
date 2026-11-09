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
 */

import { SLUG_PATTERN, slugify } from "./slug.ts";
import { isJournalVisible } from "./visibility.ts";

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

/** Rapikan label bebas: buang spasi di tepi dan spasi ganda. */
export function normalizeLabel(value: string): string {
  return value.replace(/\s+/g, " ").trim();
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

export type ScheduleResult =
  | { ok: true; status: JournalStatusValue; publishedAt: Date | null }
  | { ok: false; error: string };

/** Status & tanggal yang disimpan dari pilihan di form (lihat aturan di atas). */
export function resolveJournalSchedule(
  status: JournalStatusValue,
  publishedAt: Date | null,
  now: Date = new Date(),
): ScheduleResult {
  if (status === "DRAFT") return { ok: true, status, publishedAt };

  if (!publishedAt) {
    if (status === "SCHEDULED") {
      return { ok: false, error: "Tanggal publikasi wajib diisi untuk artikel terjadwal." };
    }
    return { ok: true, status: "PUBLISHED", publishedAt: now };
  }

  return {
    ok: true,
    status: publishedAt.getTime() > now.getTime() ? "SCHEDULED" : "PUBLISHED",
    publishedAt,
  };
}

/**
 * Status yang sebenarnya berlaku sekarang — dipakai label di dashboard.
 * SCHEDULED yang waktunya sudah lewat sudah tampil publik → PUBLISHED;
 * PUBLISHED bertanggal masa depan belum tampil → SCHEDULED.
 */
export function effectiveJournalStatus(
  post: { status: string; publishedAt?: Date | null },
  now: Date = new Date(),
): JournalStatusValue {
  if (post.status !== "SCHEDULED" && post.status !== "PUBLISHED") return "DRAFT";
  return isJournalVisible(post, now) ? "PUBLISHED" : "SCHEDULED";
}

/** Isi editor kosong (mis. hanya `<p><br></p>`) — tanpa teks maupun gambar. */
export function isRichTextEmpty(html: string): boolean {
  if (/<(img|iframe|video)\b/i.test(html)) return false;
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .trim();
  return text.length === 0;
}

export type SeoLengthState = "empty" | "short" | "ideal" | "long";

/**
 * Penilaian panjang meta SEO terhadap panjang idealnya: di bawah ±50% →
 * "short", sampai batas ideal → "ideal", lebih dari itu → "long" (terpotong).
 */
export function seoLengthState(length: number, ideal: number): SeoLengthState {
  if (length === 0) return "empty";
  if (length > ideal) return "long";
  if (length < Math.round(ideal / 2)) return "short";
  return "ideal";
}

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
