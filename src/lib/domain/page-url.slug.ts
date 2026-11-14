/** Slug halaman bebas (`StaticPage`) — lihat `page-url.ts`. */
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