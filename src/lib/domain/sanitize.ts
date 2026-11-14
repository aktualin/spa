/**
 * Sanitizer HTML untuk konten yang ditulis admin.
 *
 * Admin trusted, tapi konten tetap bisa tersalin dari sumber luar (artikel,
 * deskripsi paket). Sanitizer ini mencabut tag berbahaya (`<script>`,
 * `<iframe>`, `on*` handler, `javascript:`) dan menyisakan hanya tag serta
 * atribut yang aman.
 *
 * Sengaja tanpa dependency eksternal: daftar tag/atribut yang diizinkan masih
 * stabil dan jauh lebih ringan untuk di-review.
 *
 * Implementasinya dipecah ke berkas `sanitize.*.ts` di folder ini; berkas ini
 * hanya mengekspor ulang simbol publiknya.
 */

export { ALLOWED_TAGS, ALLOWED_ATTRIBUTES } from "./sanitize.allowlist.ts";
export { sanitizeHtml, stripTags } from "./sanitize.html.ts";