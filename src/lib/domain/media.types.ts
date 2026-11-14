/** Tipe & batas unggahan Media Library — lihat `media.ts`. */

export class MediaValidationError extends Error {}

export const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export type MediaMimeType = (typeof ALLOWED_MEDIA_TYPES)[number];

/**
 * Batas ukuran 4 MB. Body request ke fungsi serverless Vercel dibatasi
 * 4,5 MB; unggahan di atas itu gagal sebelum sampai ke kode kita.
 */
export const MAX_MEDIA_BYTES = 4 * 1024 * 1024;

/** Panjang maksimal nama berkas (tanpa ekstensi) setelah dirapikan. */
export const MAX_FILE_BASENAME = 80;

export const EXTENSIONS_BY_TYPE: Record<MediaMimeType, readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/avif": ["avif"],
  "image/gif": ["gif"],
};

export const TYPE_LABEL = "JPG, PNG, WebP, AVIF, atau GIF";

export function isAllowedMediaType(type: string): type is MediaMimeType {
  return (ALLOWED_MEDIA_TYPES as readonly string[]).includes(type);
}

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}