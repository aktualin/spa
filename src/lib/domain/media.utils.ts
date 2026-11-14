/** Helper Media Library: urutan, nama tampilan, key storage, URL di HTML. */
import {
  ALLOWED_MEDIA_TYPES,
  EXTENSIONS_BY_TYPE,
  type MediaMimeType,
  extensionOf,
} from "./media.types.ts";

/** Pindahkan item ke atas/bawah dalam daftar urut; mengembalikan urutan id baru. */
export function moveInList(ids: readonly string[], id: string, direction: "up" | "down"): string[] {
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= ids.length) return [...ids];
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Panjang maksimal nama berkas tampilan di Media Library. */
export const MAX_DISPLAY_NAME = 120;

/**
 * Validasi nama berkas tampilan (hanya label di Media Library, tidak mengubah
 * URL). Mengembalikan pesan galat, atau null bila valid.
 */
export function mediaDisplayNameError(name: string): string | null {
  const value = name.trim();
  if (value === "") return "Nama file wajib diisi.";
  if (value.length > MAX_DISPLAY_NAME) {
    return `Nama file terlalu panjang (maksimal ${MAX_DISPLAY_NAME} karakter).`;
  }
  if (/[\u0000-\u001f\u007f/\\]/.test(value)) {
    return "Nama file tidak boleh mengandung / \\ atau karakter kontrol.";
  }
  return null;
}

/** Tipe MIME dari ekstensi nama berkas; null bila bukan gambar yang didukung. */
export function mimeTypeFromFileName(name: string): MediaMimeType | null {
  const ext = extensionOf(name.split(/[?#]/)[0]);
  for (const type of ALLOWED_MEDIA_TYPES) {
    if (EXTENSIONS_BY_TYPE[type].includes(ext)) return type;
  }
  return null;
}

/** "gallery/ab12cd34-foto.jpg" → { folder: "gallery", fileName: "ab12cd34-foto.jpg" }. */
export function splitStorageKey(key: string): { folder: string; fileName: string } {
  const parts = key.split("/").filter(Boolean);
  const fileName = parts.at(-1) ?? key;
  const folder = parts.length > 1 ? parts[0] : "misc";
  return { folder: folder || "misc", fileName: fileName || "media" };
}

/** Semua nilai atribut `src` pada tag `<img>` di dalam HTML (unik, urut kemunculan). */
export function extractImageUrls(html: string): string[] {
  const found = new Set<string>();
  const pattern = /<img\b[^>]*?\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  for (const match of html.matchAll(pattern)) {
    const url = (match[1] ?? match[2] ?? match[3] ?? "").trim().replace(/&amp;/g, "&");
    if (url) found.add(url);
  }
  return [...found];
}