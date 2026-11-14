/** Path entri SEO — lihat `seo.ts`. */
import { SLUG_PATTERN } from "./slug.ts";

export function normalizeSeoPath(path: string): string {
  const trimmed = path.trim();
  if (trimmed === "" || trimmed === "/") return "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, "");
}

/** Pesan galat untuk path entri SEO, atau null bila valid. */
export function seoPathError(path: string): string | null {
  const value = path.trim();
  if (!value) return "Path wajib diisi.";
  if (!value.startsWith("/")) return 'Path harus diawali "/".';
  if (/\s/.test(value)) return "Path tidak boleh mengandung spasi.";
  if (/[?#]/.test(value)) return "Path tidak boleh memuat ? atau # — cukup alamat halamannya.";
  if (/^https?:/i.test(value) || value.startsWith("//")) {
    return "Isi path saja (mis. /contact), bukan URL lengkap.";
  }
  const normalized = normalizeSeoPath(value);
  if (/^\/(admin|api)(\/|$)/.test(normalized)) {
    return "Halaman admin dan API tidak diindeks, jadi tidak perlu entri SEO.";
  }
  return null;
}

/** true bila setiap segmen path berupa slug (huruf kecil, angka, tanda hubung). */
export function isSeoFriendlyPath(path: string): boolean {
  const normalized = normalizeSeoPath(path);
  if (normalized === "/") return true;
  return normalized
    .slice(1)
    .split("/")
    .every((segment) => SLUG_PATTERN.test(segment));
}