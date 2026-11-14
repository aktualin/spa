/**
 * Teks konten yang bisa berupa HTML (dari editor teks kaya) atau teks polos
 * (diisi sebelum editor tersedia / lewat seed). Modul murni.
 *
 * Alur render konten admin di halaman publik selalu:
 *   `toSafeHtml(nilai)` → plainTextToHtml (bila teks polos) → sanitizeHtml.
 * Untuk meta description / pesan WhatsApp / ringkasan kartu pakai
 * `toPlainText(nilai)` supaya tag HTML tidak pernah bocor sebagai teks.
 *
 * Konversi teks polos → HTML ada di `rich-text.html.ts`; berkas ini
 * mengekspor ulangnya plus pembacaan teks polos & format editor.
 */
import { looksLikeHtml } from "./rich-text.html.ts";
import { sanitizeHtml } from "./sanitize.ts";

export { looksLikeHtml, plainTextToHtml, toSafeHtml } from "./rich-text.html.ts";

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