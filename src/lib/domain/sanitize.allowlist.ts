/** Daftar putih tag/atribut sanitizer HTML — lihat `sanitize.ts`. */

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
export const URL_ATTRIBUTES = new Set(["href", "src"]);

/** Skema yang boleh dipakai pada atribut URL. */
export const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

/** `https:`, `javascript:`, `data:` — bagian sebelum tanda titik dua pertama. */
export const SCHEME_PATTERN = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;

export const TAG_PATTERN = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*?)?)\/?>/g;
export const ATTRIBUTE_PATTERN = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;