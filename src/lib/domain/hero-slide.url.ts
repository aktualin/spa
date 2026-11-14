/** Validasi URL & tipe media slide hero — lihat `hero-slide.ts`. */
import { HERO_SLIDE_LIMITS, type HeroSlideMediaType } from "./hero-slide.types.ts";
import { clean } from "./text.ts";

function hasVideoExtension(path: string): boolean {
  const pathname = path.split(/[?#]/, 1)[0] ?? path;
  return /\.(mp4|webm)$/i.test(pathname);
}

/**
 * URL video: hanya `https://…` (bucket S3) dengan ekstensi `.mp4`/`.webm`.
 * Path lokal (`/video/…`) dan halaman YouTube/Vimeo (bukan direct file) ditolak.
 */
export function isSafeVideoUrl(value: string): boolean {
  if (!value || value.length > HERO_SLIDE_LIMITS.videoUrl) return false;
  if (/\s/.test(value)) return false;


  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.length > 0 &&
      hasVideoExtension(url.pathname)
    );
  } catch {
    return false;
  }
}

export function normalizeMediaType(value: string | null | undefined): HeroSlideMediaType | null {
  const normalized = clean(value).toUpperCase();
  return normalized === "IMAGE" || normalized === "VIDEO" ? normalized : null;
}