/**
 * Teks konten yang bisa berupa HTML (dari editor teks kaya) atau teks polos
 * (diisi sebelum editor tersedia / lewat seed). Modul murni.
 */

const HTML_TAG = /<\/?(p|br|ul|ol|li|strong|em|b|i|a|h[1-6]|div|span)\b[^>]*>/i;

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
