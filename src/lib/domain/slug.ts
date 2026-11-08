/**
 * Pembuat slug untuk URL publik.
 *
 * Aturan yang berlaku di seluruh admin: huruf kecil, angka, dan tanda hubung
 * saja. Semua modul admin memvalidasi slug dengan `isValidSlug` ini supaya
 * tidak ada dua implementasi berbeda.
 */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** true bila `value` sudah sesuai pola slug yang diizinkan. */
export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

/**
 * Mengubah teks bebas menjadi slug yang valid.
 * "Sukma Laya — 60 Min" → "sukma-laya-60-min"
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    // Buang tanda baca (combining marks) hasil normalisasi.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
