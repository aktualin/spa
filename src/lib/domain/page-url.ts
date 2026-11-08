/**
 * Aturan URL halaman bebas (`StaticPage`, tampil di `/<slug>`) dan redirect.
 * Murni — tanpa Prisma/Next — supaya bisa dipakai admin, proxy, dan unit test.
 */

import { SLUG_PATTERN } from "./slug.ts";

export const MAX_PAGE_SLUG_LENGTH = 80;

/**
 * Segmen pertama URL yang tidak boleh dipakai sebagai slug halaman.
 * Wajib memuat setiap folder route di `src/app/` (dijaga unit test), ditambah
 * path sistem Next.js, berkas metadata, dan folder `public/`.
 */
export const RESERVED_ROOT_SEGMENTS: readonly string[] = [
  // Sistem
  "admin",
  "api",
  "_next",
  "static",
  // Route publik yang sudah ada di src/app
  "contact",
  "corporate",
  "corporate-wellness",
  "events",
  "gallery",
  "gift-card",
  "membership",
  "menu",
  "our-story",
  "promos",
  "retail",
  "treatments",
  // Berkas metadata yang dibuat Next.js
  "sitemap",
  "robots",
  "favicon",
  "icon",
  "apple-icon",
  "manifest",
  "opengraph-image",
  "twitter-image",
  // Folder di public/
  "img",
];

const RESERVED = new Set(RESERVED_ROOT_SEGMENTS);

/** Pesan galat untuk slug halaman, atau null bila boleh dipakai. */
export function validatePageSlug(slug: string): string | null {
  if (slug.length === 0) return "Slug wajib diisi.";
  if (/\s/.test(slug)) return "Slug tidak boleh mengandung spasi.";
  if (slug.length > MAX_PAGE_SLUG_LENGTH) {
    return `Slug maksimal ${MAX_PAGE_SLUG_LENGTH} karakter.`;
  }
  if (slug.includes("/")) {
    return "Slug hanya satu bagian URL, tanpa garis miring.";
  }
  if (!SLUG_PATTERN.test(slug)) {
    return "Slug hanya boleh huruf kecil, angka, dan tanda hubung (tidak di awal/akhir, tidak ganda).";
  }
  if (RESERVED.has(slug)) {
    return `Slug "${slug}" bentrok dengan alamat sistem atau halaman yang sudah ada (/${slug}).`;
  }
  return null;
}

/** Path publik halaman. */
export function pagePath(slug: string): string {
  return `/${slug}`;
}

/** URL lengkap untuk pratinjau di form admin; null bila slug belum valid. */
export function buildPreviewUrl(siteUrl: string, slug: string): string | null {
  if (validatePageSlug(slug) !== null) return null;
  return `${siteUrl.replace(/\/+$/, "")}${pagePath(slug)}`;
}

/**
 * Bentuk baku path untuk pencocokan redirect: diawali satu `/`, tanpa garis
 * miring di akhir (kecuali root), tanpa query/hash, huruf kecil.
 */
export function normalizePath(input: string): string {
  let path = input.trim();
  const cut = path.search(/[?#]/);
  if (cut !== -1) path = path.slice(0, cut);
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path.toLowerCase();
}

const SYSTEM_PREFIXES = ["/admin", "/api", "/_next"];

function isSystemPath(path: string): boolean {
  return SYSTEM_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

/** Validasi redirect yang diisi manual. Mengembalikan pesan galat atau null. */
export function validateRedirectInput(
  fromPath: string,
  toPath: string,
): string | null {
  if (!fromPath.startsWith("/") || fromPath.startsWith("//")) {
    return "URL asal harus berupa path internal yang diawali /.";
  }
  if (fromPath === "/") return "Halaman utama tidak boleh dialihkan.";
  if (isSystemPath(fromPath)) {
    return "URL asal tidak boleh berada di /admin, /api, atau /_next.";
  }

  const isInternal = toPath.startsWith("/") && !toPath.startsWith("//");
  const isHttps = /^https:\/\/[^\s/]+\.[^\s]+$/i.test(toPath);
  if (!isInternal && !isHttps) {
    return "URL tujuan harus path internal (diawali /) atau alamat https:// lengkap.";
  }
  if (/\s/.test(toPath)) return "URL tujuan tidak boleh mengandung spasi.";
  if (isInternal && isSystemPath(normalizePath(toPath))) {
    return "URL tujuan tidak boleh mengarah ke /admin, /api, atau /_next.";
  }
  if (isInternal && normalizePath(fromPath) === normalizePath(toPath)) {
    return "URL asal dan tujuan tidak boleh sama.";
  }
  return null;
}

export type RedirectRule = { fromPath: string; toPath: string };

/**
 * True bila menambah `fromPath → toPath` membentuk putaran, dengan mengikuti
 * rantai redirect yang sudah ada mulai dari `toPath`.
 */
export function createsRedirectLoop(
  existing: readonly RedirectRule[],
  fromPath: string,
  toPath: string,
): boolean {
  const map = new Map(
    existing
      .filter((r) => normalizePath(r.fromPath) !== normalizePath(fromPath))
      .map((r) => [normalizePath(r.fromPath), r.toPath]),
  );
  const start = normalizePath(fromPath);
  let current = toPath;
  for (let step = 0; step <= map.size; step += 1) {
    if (!current.startsWith("/")) return false; // eksternal = ujung rantai
    const key = normalizePath(current);
    if (key === start) return true;
    const next = map.get(key);
    if (next === undefined) return false;
    current = next;
  }
  return true;
}

export type SlugRedirectPlan = {
  /** Redirect yang dibuat/diubah (upsert berdasarkan fromPath). */
  upserts: RedirectRule[];
  /** fromPath redirect yang harus dihapus. */
  deletes: string[];
};

/**
 * Perubahan redirect saat URL halaman pindah dari `oldPath` ke `newPath`:
 * 1. URL lama dialihkan ke URL baru.
 * 2. Redirect lain yang menuju URL lama diarahkan langsung ke URL baru
 *    (rantai A→B→C diratakan menjadi A→C).
 * 3. Redirect yang berasal dari URL baru dihapus — halaman kini hidup di sana,
 *    jadi alamat itu tidak boleh lagi dialihkan (sekaligus mencegah loop saat
 *    slug dikembalikan ke nilai lama).
 */
export function planSlugRedirect(
  existing: readonly RedirectRule[],
  oldPath: string,
  newPath: string,
): SlugRedirectPlan {
  const from = normalizePath(oldPath);
  const to = normalizePath(newPath);
  if (from === to) return { upserts: [], deletes: [] };

  const deletes = existing
    .filter((r) => normalizePath(r.fromPath) === to)
    .map((r) => r.fromPath);

  const upserts: RedirectRule[] = existing
    .filter(
      (r) =>
        r.toPath.startsWith("/") &&
        normalizePath(r.toPath) === from &&
        normalizePath(r.fromPath) !== to &&
        normalizePath(r.fromPath) !== from,
    )
    .map((r) => ({ fromPath: r.fromPath, toPath: to }));

  upserts.push({ fromPath: from, toPath: to });
  return { upserts, deletes };
}

export type RedirectTarget = { toPath: string; statusCode: number };

/** Dipakai proxy: cari tujuan redirect untuk pathname permintaan. */
export function resolveRedirect(
  map: ReadonlyMap<string, RedirectTarget>,
  pathname: string,
): RedirectTarget | null {
  if (isSystemPath(pathname)) return null;
  return map.get(normalizePath(pathname)) ?? null;
}
