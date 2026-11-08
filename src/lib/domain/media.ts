/**
 * Aturan Media Library (modul Media): validasi berkas unggahan dan daftar
 * kolom database yang menyimpan URL gambar.
 *
 * Modul murni (tanpa I/O) supaya bisa diuji langsung dengan `node --test`.
 */

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

const TYPE_LABEL = "JPG, PNG, WebP, AVIF, atau GIF";

export function isAllowedMediaType(type: string): type is MediaMimeType {
  return (ALLOWED_MEDIA_TYPES as readonly string[]).includes(type);
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

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

/** 1536000 → "1,5 MB", 2048 → "2 KB". */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Kolom yang menyimpan URL gambar. Dipakai untuk menghitung "dipakai di" dan
 * untuk mengganti URL ketika berkas media diganti. Nama model = delegate Prisma.
 */
export const MEDIA_URL_COLUMNS = [
  { model: "treatmentCategory", field: "imageUrl", label: "Kategori treatment" },
  { model: "treatment", field: "imageUrl", label: "Treatment" },
  { model: "package", field: "imageUrl", label: "Package" },
  { model: "galleryAlbum", field: "coverUrl", label: "Sampul album" },
  { model: "galleryPhoto", field: "imageUrl", label: "Foto gallery" },
  { model: "promo", field: "bannerUrl", label: "Promo" },
  { model: "giftCardInfo", field: "imageUrl", label: "Gift card" },
  { model: "journalPost", field: "coverUrl", label: "Journal" },
  { model: "eventItem", field: "coverUrl", label: "Event" },
  { model: "eventPhoto", field: "imageUrl", label: "Foto event" },
  { model: "retailProduct", field: "imageUrl", label: "Produk retail" },
  { model: "homepageSection", field: "imageUrl", label: "Homepage" },
  { model: "homepageSection", field: "mobileImageUrl", label: "Homepage (mobile)" },
  { model: "ourStoryContent", field: "heroImageUrl", label: "Our Story" },
  { model: "pageSeo", field: "ogImageUrl", label: "Gambar SEO" },
  { model: "eventItem", field: "partnerLogoUrl", label: "Logo mitra event" },
  { model: "corporateProgram", field: "imageUrl", label: "Program corporate" },
  { model: "corporateClient", field: "logoUrl", label: "Logo klien corporate" },
  { model: "homepageHighlight", field: "imageUrl", label: "Highlight homepage" },
  { model: "instagramPost", field: "imageUrl", label: "Feed Instagram" },
  { model: "siteSettings", field: "faviconUrl", label: "Favicon" },
  { model: "siteSettings", field: "defaultOgImageUrl", label: "Gambar OG bawaan" },
] as const;

/**
 * Kolom berisi DAFTAR URL gambar (Postgres text[]). Pemakaian dicek dengan
 * `has`, dan URL diganti dengan `array_replace` saat berkas media diganti.
 */
export const MEDIA_URL_ARRAY_COLUMNS = [
  { model: "corporateClient", table: "CorporateClient", field: "photoUrls", label: "Dokumentasi klien corporate" },
] as const;

export type MediaUrlColumn = (typeof MEDIA_URL_COLUMNS)[number];

/** Pindahkan item ke atas/bawah dalam daftar urut; mengembalikan urutan id baru. */
export function moveInList(ids: readonly string[], id: string, direction: "up" | "down"): string[] {
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= ids.length) return [...ids];
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/**
 * Kolom HTML (editor teks kaya) yang bisa memuat URL gambar di dalam isinya.
 * `table` = nama tabel Postgres (model Prisma tanpa @@map), dipakai untuk
 * `REPLACE` lewat SQL mentah ketika berkas media diganti.
 */
export const MEDIA_HTML_COLUMNS = [
  { table: "GiftCardInfo", model: "giftCardInfo", field: "bodyHtml", label: "Gift card (isi)" },
  { table: "JournalPost", model: "journalPost", field: "bodyHtml", label: "Journal (isi)" },
  { table: "CorporateContent", model: "corporateContent", field: "inOfficeHtml", label: "Corporate (in-office)" },
  { table: "CorporateContent", model: "corporateContent", field: "inSpaHtml", label: "Corporate (in-spa)" },
  { table: "CorporateContent", model: "corporateContent", field: "stepsHtml", label: "Corporate (langkah)" },
  { table: "HomepageSection", model: "homepageSection", field: "bodyHtml", label: "Homepage (isi)" },
  { table: "OurStoryContent", model: "ourStoryContent", field: "philosophyHtml", label: "Our Story (filosofi)" },
  { table: "OurStoryContent", model: "ourStoryContent", field: "valuesHtml", label: "Our Story (nilai)" },
  { table: "StaticPage", model: "staticPage", field: "bodyHtml", label: "Halaman (isi)" },
] as const;

export type MediaHtmlColumn = (typeof MEDIA_HTML_COLUMNS)[number];

/** Panjang maksimal nama berkas tampilan di Media Library. */
export const MAX_DISPLAY_NAME = 120;

/**
 * Validasi nama berkas tampilan (hanya label di Media Library, tidak mengubah
 * URL). Mengembalikan pesan galat, atau null bila valid.
 */
export function mediaDisplayNameError(name: string): string | null {
  const value = name.trim();
  if (value === "") return "Nama file wajib diisi.";
  if (value.length > MAX_DISPLAY_NAME) {
    return `Nama file terlalu panjang (maksimal ${MAX_DISPLAY_NAME} karakter).`;
  }
  if (/[\u0000-\u001f\u007f/\\]/.test(value)) {
    return "Nama file tidak boleh mengandung / \\ atau karakter kontrol.";
  }
  return null;
}

/** Tipe MIME dari ekstensi nama berkas; null bila bukan gambar yang didukung. */
export function mimeTypeFromFileName(name: string): MediaMimeType | null {
  const ext = extensionOf(name.split(/[?#]/)[0]);
  for (const type of ALLOWED_MEDIA_TYPES) {
    if (EXTENSIONS_BY_TYPE[type].includes(ext)) return type;
  }
  return null;
}

/** "gallery/ab12cd34-foto.jpg" → { folder: "gallery", fileName: "ab12cd34-foto.jpg" }. */
export function splitStorageKey(key: string): { folder: string; fileName: string } {
  const parts = key.split("/").filter(Boolean);
  const fileName = parts.at(-1) ?? key;
  const folder = parts.length > 1 ? parts[0] : "misc";
  return { folder: folder || "misc", fileName: fileName || "media" };
}

/** Semua nilai atribut `src` pada tag `<img>` di dalam HTML (unik, urut kemunculan). */
export function extractImageUrls(html: string): string[] {
  const found = new Set<string>();
  const pattern = /<img\b[^>]*?\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  for (const match of html.matchAll(pattern)) {
    const url = (match[1] ?? match[2] ?? match[3] ?? "").trim().replace(/&amp;/g, "&");
    if (url) found.add(url);
  }
  return [...found];
}
