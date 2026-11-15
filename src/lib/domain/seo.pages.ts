/**
 * Bawaan SEO per halaman (title/description/keywords) yang didefinisikan di
 * kode — lihat `seo.ts`. Registry ini mengisi halaman yang tidak membawa
 * metadata eksplisit sendiri; override `PageSeo` di DB tetap menang di atasnya
 * (lihat `mergePageSeo` di `seo.metadata.ts`).
 */
import { normalizeSeoPath } from "./seo.path.ts";
import { PAGE_SEO_DATA_CONTENT } from "./seo.pages-content.ts";
import { PAGE_SEO_DATA_MAIN } from "./seo.pages-main.ts";

export type PageSeoDefaults = {
  /** Judul mentah; template " • KAMA Spa" ditambahkan otomatis. */
  title?: string;
  description?: string;
  keywords?: readonly string[];
};

/** Gabungan keywords maksimal per halaman agar tidak terlihat spam. */
export const MAX_PAGE_KEYWORDS = 12;

export const PAGE_SEO_DEFAULTS: Readonly<Record<string, PageSeoDefaults>> = {
  ...PAGE_SEO_DATA_MAIN,
  ...PAGE_SEO_DATA_CONTENT,
};

/**
 * Entri registry untuk sebuah path: exact match dulu, lalu prefix terpanjang
 * (route dinamis seperti `/treatments/massage/sukma-laya` mewarisi entri
 * `/treatments`). `undefined` bila tidak ada yang cocok.
 */
export function routeSeoDefaults(path: string): PageSeoDefaults | undefined {
  const p = normalizeSeoPath(path);
  let best: string | undefined;
  for (const key of Object.keys(PAGE_SEO_DEFAULTS)) {
    const matches = p === key || (key !== "/" && p.startsWith(`${key}/`));
    if (matches && (!best || key.length > best.length)) best = key;
  }
  return best ? PAGE_SEO_DEFAULTS[best] : undefined;
}

/**
 * Gabungkan keywords route + keywords global: dedupe case-insensitive,
 * urutan route dulu, dibatasi `MAX_PAGE_KEYWORDS`.
 */
export function resolveRouteKeywords(
  routeKeywords: readonly string[] | undefined,
  siteKeywords: readonly string[],
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of [...(routeKeywords ?? []), ...siteKeywords]) {
    const kw = raw.trim();
    const key = kw.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(kw);
    if (out.length >= MAX_PAGE_KEYWORDS) break;
  }
  return out;
}
