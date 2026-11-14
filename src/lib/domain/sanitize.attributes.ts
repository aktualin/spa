/** Pemeriksaan atribut & URL sanitizer HTML — lihat `sanitize.ts`. */
import {
  ALLOWED_ATTRIBUTES,
  ATTRIBUTE_PATTERN,
  SAFE_SCHEMES,
  SCHEME_PATTERN,
  URL_ATTRIBUTES,
} from "./sanitize.allowlist.ts";

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

export function sanitizeAttributes(tag: string, raw: string): string {
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
