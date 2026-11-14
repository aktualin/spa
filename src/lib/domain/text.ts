/**
 * Helper teks kecil yang dipakai bersama oleh modul domain murni, supaya
 * perapian spasi/trim tidak ditulis ulang di tiap modul.
 */

/** Rapikan teks: buang spasi di tepi; null/undefined → string kosong. */
export function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

/** true bila isian hanya spasi/kosong (setelah trim). */
export function isBlank(value: string): boolean {
  return value.trim() === "";
}

/** Spasi ganda (termasuk tab/baris baru) menjadi satu spasi, lalu trim. */
export function collapseSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Buang karakter kontrol lalu rapikan spasi — teks aman ditampilkan di
 * admin/subjek email tanpa karakter yang merusak tampilan.
 */
export function collapseControlChars(value: string): string {
  return collapseSpaces(value.replace(/[\u0000-\u001f\u007f]+/g, " "));
}
