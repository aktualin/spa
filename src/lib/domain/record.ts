/** Pemeriksaan bentuk objek polos untuk membaca kolom JSON dari database. */

/** true bila `value` objek polos (bukan null, bukan array). */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}