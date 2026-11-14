/**
 * Aturan Media Library (modul Media): validasi berkas unggahan dan daftar
 * kolom database yang menyimpan URL gambar.
 *
 * Modul murni (tanpa I/O) supaya bisa diuji langsung dengan `node --test`.
 * Implementasinya dipecah ke berkas `media.*.ts` di folder ini; berkas ini
 * hanya mengekspor ulang simbol publiknya.
 */

export {
  MediaValidationError,
  ALLOWED_MEDIA_TYPES,
  type MediaMimeType,
  MAX_MEDIA_BYTES,
  MAX_FILE_BASENAME,
  EXTENSIONS_BY_TYPE,
  isAllowedMediaType,
} from "./media.types.ts";
export { sanitizeFileName, validateMediaFile, formatBytes } from "./media.file.ts";
export { sniffImageType, validateMediaBytes } from "./media.sniff.ts";
export {
  MEDIA_URL_COLUMNS,
  MEDIA_URL_ARRAY_COLUMNS,
  type MediaUrlColumn,
  MEDIA_HTML_COLUMNS,
  type MediaHtmlColumn,
} from "./media.columns.ts";
export {
  moveInList,
  MAX_DISPLAY_NAME,
  mediaDisplayNameError,
  mimeTypeFromFileName,
  splitStorageKey,
  extractImageUrls,
} from "./media.utils.ts";