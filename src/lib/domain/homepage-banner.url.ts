/** Validasi URL banner homepage — lihat `homepage-banner.ts`. */
import { BANNER_LIMITS } from "./homepage-banner.config.ts";

/** Path internal: diawali satu "/", bukan "//" atau "/\" (protocol-relative). */
function isInternalPath(value: string): boolean {
  return /^\/(?![/\\])[^\s]*$/.test(value);
}

function isHttpsUrl(value: string): boolean {
  if (/\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0;
  } catch {
    return false;
  }
}

/**
 * Tujuan tombol yang diizinkan: path internal (`/menu`), anchor (`#booking`),
 * atau URL `https://…`. Menolak `//host`, `javascript:`, `http:`, dsb.
 */
export function isSafeCtaHref(value: string): boolean {
  if (!value || value.length > BANNER_LIMITS.ctaHref) return false;
  if (value.startsWith("#")) return /^#[A-Za-z0-9][\w:.-]*$/.test(value);
  if (value.startsWith("/")) return isInternalPath(value);
  return isHttpsUrl(value);
}

/**
 * URL gambar: hanya `https://…` (bucket S3 Supabase Storage). Path lokal
 * (`/img/…`) ditolak — tidak ada lagi media yang dilayani dari `public/`.
 */
export function isSafeImageUrl(value: string): boolean {
  if (!value || value.length > BANNER_LIMITS.imageUrl) return false;
  return isHttpsUrl(value);
}