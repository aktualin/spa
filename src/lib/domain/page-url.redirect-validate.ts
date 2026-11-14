/** Validasi redirect manual — lihat `page-url.ts`. */
import { isSystemPath, normalizePath } from "./page-url.path.ts";

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