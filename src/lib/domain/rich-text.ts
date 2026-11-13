/**
 * Teks konten yang bisa berupa HTML (dari editor teks kaya) atau teks polos
 * (diisi sebelum editor tersedia / lewat seed). Modul murni.
 *
 * Alur render konten admin di halaman publik selalu:
 *   `toSafeHtml(nilai)` → plainTextToHtml (bila teks polos) → sanitizeHtml.
 * Untuk meta description / pesan WhatsApp / ringkasan kartu pakai
 * `toPlainText(nilai)` supaya tag HTML tidak pernah bocor sebagai teks.
 */
import { sanitizeHtml } from "./sanitize.ts";

const HTML_TAG =
  /<\/?(p|br|hr|ul|ol|li|dl|dt|dd|strong|em|b|i|u|s|small|sup|sub|a|img|figure|figcaption|blockquote|table|thead|tbody|tfoot|tr|th|td|h[1-6]|div|span)\b[^>]*>/i;

export function looksLikeHtml(value: string): boolean {
  return HTML_TAG.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const LIST_ITEM = /^\s*(?:[-*•]|\d+[.)])\s+/;

/**
 * Teks polos → HTML sederhana: blok dipisah baris kosong menjadi paragraf,
 * blok yang semua barisnya diawali "-", "•", atau "1." menjadi daftar, dan
 * baris baru di dalam paragraf menjadi <br>. HTML dikembalikan apa adanya
 * (tetap wajib disanitasi oleh pemanggil sebelum dirender).
 */
export function plainTextToHtml(value: string): string {
  const text = value.replace(/\r\n?/g, "\n").trim();
  if (text === "") return "";
  if (looksLikeHtml(text)) return text;

  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.length > 0 && lines.every((line) => LIST_ITEM.test(line))) {
        const ordered = /^\d/.test(lines[0]);
        const items = lines
          .map((line) => `<li>${escapeHtml(line.replace(LIST_ITEM, ""))}</li>`)
          .join("");
        return ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
      }
      return `<p>${lines.map(escapeHtml).join("<br>")}</p>`;
    })
    .join("");
}

/**
 * HTML aman untuk dirender dari nilai konten admin — HTML dari editor maupun
 * teks polos lama. String kosong bila tidak ada isi.
 */
export function toSafeHtml(value: string | null | undefined): string {
  if (!value) return "";
  return sanitizeHtml(plainTextToHtml(value)).trim();
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  apos: "'",
  nbsp: " ",
};

/**
 * Teks polos dari nilai konten (HTML atau teks): tag dibuang, batas blok
 * menjadi spasi, entitas umum didekode, spasi dirapikan. Untuk meta
 * description, pesan WhatsApp, dan ringkasan kartu.
 */
export function toPlainText(value: string | null | undefined, maxLength?: number): string {
  if (!value) return "";
  const text = value
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|blockquote|tr|td|th|dt|dd|figcaption)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, name: string) => ENTITIES[name] ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!maxLength || text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Nilai field berformat dari form admin, siap disimpan: HTML disanitasi,
 * teks polos dipertahankan, dan isi yang secara visual kosong (mis. `<p><br></p>`
 * dari editor) menjadi string kosong supaya disimpan sebagai NULL.
 */
export function richTextInput(value: FormDataEntryValue | string | null | undefined): string {
  if (typeof value !== "string") return "";
  const raw = value.trim();
  if (!raw) return "";
  const clean = looksLikeHtml(raw) ? sanitizeHtml(raw).trim() : raw;
  const hasMedia = /<(img|hr|table)\b/i.test(clean);
  return toPlainText(clean) || hasMedia ? clean : "";
}

/** Panjang teks yang terlihat pengunjung — dipakai untuk batas karakter field berformat. */
export function richTextLength(value: string | null | undefined): number {
  return toPlainText(value).length;
}

const BLOCK_CLOSE = /(<\/(?:p|h[1-6]|li|ul|ol|dl|dt|dd|blockquote|table|thead|tbody|tfoot|tr|figure|figcaption|div)>|<hr\s*\/?>|<br\s*\/?>)/gi;
const BLOCK_OPEN = /(<(?:ul|ol|dl|table|thead|tbody|tfoot|tr|li|figure)\b[^>]*>)/gi;

/**
 * HTML editor (satu baris panjang) → satu blok per baris untuk tab HTML admin.
 * Hanya menambah baris baru di antara tag blok, jadi hasil render tidak berubah.
 */
export function formatHtmlForEditing(html: string): string {
  return html
    .replace(BLOCK_CLOSE, "$1\n")
    .replace(BLOCK_OPEN, "\n$1")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}
