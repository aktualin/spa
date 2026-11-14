/** Pemeriksaan isi berkas (magic number) — lihat `media.ts`. */
import { validateMediaFile } from "./media.file.ts";
import { MediaValidationError, type MediaMimeType } from "./media.types.ts";

/**
 * Tipe gambar dari byte awal berkas (magic number). Mencegah berkas lain yang
 * diberi ekstensi/tipe gambar palsu. Null bila tidak dikenali.
 */
export function sniffImageType(bytes: Uint8Array): MediaMimeType | null {
  const at = (offset: number, sig: number[]) =>
    sig.every((byte, i) => bytes[offset + i] === byte);
  const ascii = (offset: number, text: string) =>
    at(offset, [...text].map((c) => c.charCodeAt(0)));

  if (at(0, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (at(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (ascii(0, "GIF87a") || ascii(0, "GIF89a")) return "image/gif";
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";
  if (ascii(4, "ftyp") && (ascii(8, "avif") || ascii(8, "avis"))) return "image/avif";
  return null;
}

/** Validasi lengkap: metadata + isi berkas harus sesuai tipe yang diklaim. */
export function validateMediaBytes(
  file: { name: string; type: string; size: number },
  head: Uint8Array,
): MediaMimeType {
  const type = validateMediaFile(file);
  const sniffed = sniffImageType(head);
  if (sniffed !== type) {
    throw new MediaValidationError(
      "Isi file tidak sesuai dengan tipenya. Pastikan file adalah gambar asli.",
    );
  }
  return type;
}