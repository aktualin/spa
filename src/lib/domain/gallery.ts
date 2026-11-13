/**
 * Aturan modul Foto & Gallery: urutan album/foto, daftar URL unggahan massal,
 * dan teks alternatif foto di halaman publik.
 *
 * Modul murni (tanpa I/O) supaya bisa diuji langsung dengan `node --test`.
 */

import { MediaValidationError, validateMediaFile } from "./media.ts";

/** Batas foto dalam satu kali "Unggah banyak foto". */
export const MAX_BATCH_PHOTOS = 30;

/**
 * Nilai `sortOrder` baru untuk daftar id yang sudah terurut: 0, 1, 2, …
 * Dipakai setelah `moveInList` supaya urutan selalu rapat dan tanpa nilai kembar.
 */
export function sequentialSortOrders(ids: readonly string[]): { id: string; sortOrder: number }[] {
  return ids.map((id, index) => ({ id, sortOrder: index }));
}

/**
 * `sortOrder` untuk `count` foto baru yang diletakkan di akhir album.
 * `last` = sortOrder terbesar yang sudah ada (null bila album masih kosong).
 */
export function appendSortOrders(last: number | null, count: number): number[] {
  const start = last === null ? 0 : last + 1;
  return Array.from({ length: Math.max(0, count) }, (_, i) => start + i);
}

/** URL foto yang sah: hanya https:// dari bucket S3 (Supabase Storage). */
export function isPhotoUrl(value: string): boolean {
  return /^https:\/\/\S+$/.test(value);
}

/**
 * Validasi daftar URL dari klien untuk unggahan massal. Data dari klien tidak
 * dipercaya: harus array string, URL sah, tidak kosong, dan tidak melebihi batas.
 * URL kembar hanya disimpan sekali (urutan pertama dipertahankan).
 */
export function parseBatchPhotoUrls(
  input: unknown,
): { ok: true; urls: string[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) return { ok: false, error: "Daftar foto tidak valid." };

  const urls: string[] = [];
  for (const item of input) {
    if (typeof item !== "string") return { ok: false, error: "Daftar foto tidak valid." };
    const url = item.trim();
    if (!isPhotoUrl(url)) return { ok: false, error: "Ada URL foto yang tidak valid." };
    if (!urls.includes(url)) urls.push(url);
  }

  if (urls.length === 0) return { ok: false, error: "Belum ada foto yang berhasil diunggah." };
  if (urls.length > MAX_BATCH_PHOTOS) {
    return { ok: false, error: `Maksimal ${MAX_BATCH_PHOTOS} foto sekali unggah.` };
  }
  return { ok: true, urls };
}

/**
 * Pra-validasi berkas di browser sebelum diunggah. Mengembalikan pesan error
 * per berkas (null = lolos). Validasi final tetap dilakukan server.
 */
export function precheckUploadFile(file: { name: string; type: string; size: number }): string | null {
  try {
    validateMediaFile(file);
    return null;
  } catch (error) {
    if (error instanceof MediaValidationError) return error.message;
    throw error;
  }
}

/**
 * Teks alt foto di halaman publik: alt text → caption → nama album.
 * String kosong/spasi dianggap tidak diisi.
 */
export function photoAltText(
  photo: { altText: string | null; caption: string | null },
  albumName: string,
): string {
  const alt = photo.altText?.trim();
  if (alt) return alt;
  const caption = photo.caption?.trim();
  if (caption) return caption;
  const name = albumName.trim();
  return name ? `Foto ${name} — KAMA Spa` : "Foto galeri KAMA Spa";
}
