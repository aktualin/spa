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
 */

/** Tag yang boleh dipertahankan. */
export const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "small",
  "sup",
  "sub",
  "h2",
  "h3",
  "h4",
  "h5",
  "blockquote",
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "hr",
  "span",
  "div",
]);

/** Atribut yang boleh dipertahankan per tag. */
export const ALLOWED_ATTRIBUTES: Record<string, readonly string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan", "scope"],
};

/** Atribut yang isinya adalah URL dan wajib lolos pemeriksaan skema. */
const URL_ATTRIBUTES = new Set(["href", "src"]);

/** Skema yang boleh dipakai pada atribut URL. */
const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

/** `https:`, `javascript:`, `data:` — bagian sebelum tanda titik dua pertama. */
const SCHEME_PATTERN = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;

const TAG_PATTERN = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*?)?)\/?>/g;
const ATTRIBUTE_PATTERN = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return false;

  // Buang karakter kontrol/whitespace yang dipakai menyamarkan skema.
  const normalized = trimmed.replace(/[\u0000-\u0020]+/g, "");
  if (normalized === "") return false;

  // URL protocol-relative (`//evil.com`) menyamar sebagai path relatif.
  if (normalized.startsWith("//")) return false;

  const scheme = SCHEME_PATTERN.exec(normalized);
  if (scheme) {
    // Skema eksplisit: hanya daftar putih yang boleh lewat.
    return SAFE_SCHEMES.has(scheme[1].toLowerCase());
  }

  // Tanpa skema = path relatif (`img/a.jpg`, `about`, `#faq`, `?q=1`) — aman.
  return true;
}

function sanitizeAttributes(tag: string, raw: string): string {
  const allowed = ALLOWED_ATTRIBUTES[tag];
  if (!allowed) return "";

  const kept: string[] = [];

  for (const match of raw.matchAll(ATTRIBUTE_PATTERN)) {
    const name = match[1].toLowerCase();
    const value = match[3] ?? match[4] ?? match[5] ?? "";

    if (!allowed.includes(name)) continue;
    if (name.startsWith("on")) continue;
    if (URL_ATTRIBUTES.has(name) && !isSafeUrl(value)) continue;

    kept.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
  }

  if (kept.length === 0) return "";

  // `target="_blank"` membuka celah tabnabbing — rel wajib memuat noopener.
  if (tag === "a" && kept.some((a) => a.startsWith("target="))) {
    const relIndex = kept.findIndex((a) => a.startsWith("rel="));
    const existing = relIndex >= 0 ? kept[relIndex] : null;
    const tokens = new Set(
      existing
        ? existing
            .slice("rel=".length)
            .replace(/"/g, "")
            .split(/\s+/)
            .filter(Boolean)
        : [],
    );
    tokens.add("noopener");
    tokens.add("noreferrer");
    const value = [...tokens].join(" ");
    if (relIndex >= 0) kept[relIndex] = `rel="${value}"`;
    else kept.push(`rel="${value}"`);
  }

  return ` ${kept.join(" ")}`;
}

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
