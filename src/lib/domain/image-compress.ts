/**
 * Rencana kompresi gambar sebelum diunggah (modul murni, diuji langsung).
 * Foto besar diperkecil di browser admin supaya situs publik ringan dan
 * unggahan tidak mendekati batas 4 MB. GIF tidak disentuh (animasi).
 */

export const COMPRESS_MIN_BYTES = 600 * 1024;
export const COMPRESS_MAX_EDGE = 2400;
export const COMPRESS_QUALITY = 0.85;

const COMPRESSIBLE = ["image/jpeg", "image/png", "image/webp"];

export type CompressionPlan = {
  width: number;
  height: number;
  mime: "image/webp";
  quality: number;
};

/** null = biarkan apa adanya. */
export function planCompression(input: {
  type: string;
  size: number;
  width: number;
  height: number;
}): CompressionPlan | null {
  if (!COMPRESSIBLE.includes(input.type)) return null;
  if (input.width <= 0 || input.height <= 0) return null;
  const oversized = Math.max(input.width, input.height) > COMPRESS_MAX_EDGE;
  if (input.size < COMPRESS_MIN_BYTES && !oversized) return null;

  const scale = oversized ? COMPRESS_MAX_EDGE / Math.max(input.width, input.height) : 1;
  return {
    width: Math.max(1, Math.round(input.width * scale)),
    height: Math.max(1, Math.round(input.height * scale)),
    mime: "image/webp",
    quality: COMPRESS_QUALITY,
  };
}

/** "Foto Spa.PNG" → "Foto Spa.webp". */
export function renameForWebp(name: string): string {
  return `${name.replace(/\.[^.]*$/, "") || "gambar"}.webp`;
}
