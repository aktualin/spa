/** Pembersihan HTML konten admin — lihat `sanitize.ts`. */
import { ALLOWED_TAGS, TAG_PATTERN } from "./sanitize.allowlist.ts";
import { sanitizeAttributes } from "./sanitize.attributes.ts";

/** Membuang seluruh isi tag berbahaya beserta isinya. */
function stripDangerousBlocks(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*$/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*$/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*$/gi, "")
    .replace(/<object\b[^>]*>[\s\S]*?<\/object\s*>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "");
}

/**
 * Membersihkan HTML dari konten admin.
 * Tag di luar daftar putih dibuang (isi teksnya tetap disimpan), atribut
 * berbahaya dibuang, dan URL dengan skema berbahaya ditolak.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";

  const cleaned = stripDangerousBlocks(html);

  return cleaned.replace(
    TAG_PATTERN,
    (full, tagRaw: string, attrsRaw: string) => {
      const tag = tagRaw.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";

      // Tag penutup harus dipertahankan, kalau tidak HTML hasil sanitize
      // tidak bisa dirender dengan benar (mis. "<p>halo" tanpa "</p>").
      if (full.startsWith("</")) return `</${tag}>`;

      const attrs = sanitizeAttributes(tag, attrsRaw ?? "");
      return `<${tag}${attrs}>`;
    },
  );
}

/** Menghapus seluruh tag dari teks biasa (mis. caption, caption singkat). */
export function stripTags(html: string | null | undefined): string {
  if (!html) return "";
  return stripDangerousBlocks(html).replace(TAG_PATTERN, "").trim();
}