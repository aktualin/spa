/** Validasi metadata berkas unggahan Media Library — lihat `media.ts`. */
import {
  EXTENSIONS_BY_TYPE,
  MAX_FILE_BASENAME,
  MAX_MEDIA_BYTES,
  MediaValidationError,
  type MediaMimeType,
  TYPE_LABEL,
  extensionOf,
  isAllowedMediaType,
} from "./media.types.ts";

/**
 * Nama berkas aman untuk storage & tampilan: huruf kecil, angka, tanda hubung.
 * "Foto Spa (1).JPG" → "foto-spa-1.jpg". Ekstensi mengikuti tipe berkas.
 */
export function sanitizeFileName(name: string, type: MediaMimeType): string {
  const base = name
    .replace(/\.[^.]*$/, "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_FILE_BASENAME)
    .replace(/-+$/g, "");
  return `${base || "media"}.${EXTENSIONS_BY_TYPE[type][0]}`;
}

/**
 * Validasi metadata berkas yang dikirim browser: tipe, ukuran, dan nama.
 * Melempar `MediaValidationError` dengan pesan yang aman ditampilkan ke admin.
 */
export function validateMediaFile(file: {
  name: string;
  type: string;
  size: number;
}): MediaMimeType {
  if (!isAllowedMediaType(file.type)) {
    throw new MediaValidationError(
      `Tipe file ${file.type || "tidak dikenal"} tidak didukung. Gunakan ${TYPE_LABEL}.`,
    );
  }
  if (file.size <= 0) {
    throw new MediaValidationError("File kosong.");
  }
  if (file.size > MAX_MEDIA_BYTES) {
    throw new MediaValidationError(
      `Ukuran file ${(file.size / 1024 / 1024).toFixed(1)} MB melebihi batas 4 MB. Kecilkan atau kompres gambar terlebih dahulu.`,
    );
  }

  const name = file.name.trim();
  if (name === "") throw new MediaValidationError("Nama file kosong.");
  if (name.length > 200) {
    throw new MediaValidationError("Nama file terlalu panjang (maksimal 200 karakter).");
  }
  // Karakter kontrol dan pemisah path tidak pernah muncul di nama berkas wajar.
  if (/[\u0000-\u001f\u007f/\\]/.test(name)) {
    throw new MediaValidationError("Nama file mengandung karakter yang tidak diizinkan.");
  }
  const ext = extensionOf(name);
  if (!EXTENSIONS_BY_TYPE[file.type].includes(ext)) {
    throw new MediaValidationError(
      `Ekstensi ".${ext || "?"}" tidak cocok dengan tipe file. Gunakan ${TYPE_LABEL}.`,
    );
  }
  return file.type;
}

/** 1536000 → "1,5 MB", 2048 → "2 KB". */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}