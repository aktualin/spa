/** Feed Instagram section Socials (embed postingan) — lihat `homepage.ts`. */
import {
  type OrderedRow,
  type SimpleValidation,
  publishedInOrder,
} from "./homepage.shared.ts";
import { clean } from "./text.ts";

/** Batas isian feed Instagram (karakter / jumlah). */
export const INSTAGRAM_LIMITS = { postUrl: 300, max: 12 } as const;

/** Jenis postingan yang didukung: foto (/p/), reel (/reel/), IGTV (/tv/). */
const POST_PATH = /^\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)\/?(?:[?#]|$)/;

export type InstagramItem = {
  key: string;
  /** URL kanonis postingan: `https://www.instagram.com/p/{code}/`. */
  postUrl: string;
  /** URL untuk iframe embed: `postUrl` + `embed`. */
  embedUrl: string;
};

/**
 * Normalisasi URL postingan Instagram ke bentuk kanonis. Menerima http/https,
 * `www.`, alias `/reels/`, dan query/fragment di belakang kode; `null` bila
 * bukan tautan postingan Instagram.
 */
export function normalizeInstagramPostUrl(input: string): string | null {
  const value = clean(input);
  if (!value || value.length > INSTAGRAM_LIMITS.postUrl) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.hostname !== "instagram.com" && url.hostname !== "www.instagram.com") return null;
  const match = POST_PATH.exec(url.pathname);
  if (!match) return null;
  const kind = match[1] === "reels" ? "reel" : match[1];
  return `https://www.instagram.com/${kind}/${match[2]}/`;
}

export type InstagramRowLike = OrderedRow & {
  id: string;
  postUrl: string;
};

/**
 * `null` = tabel kosong → section menampilkan pesan feed kosong. Baris dengan
 * URL tidak valid dibuang; postingan kembar hanya dihitung sekali.
 */
export function selectInstagramPosts(rows: InstagramRowLike[]): InstagramItem[] | null {
  if (rows.length === 0) return null;
  const seen = new Set<string>();
  const items: InstagramItem[] = [];
  for (const row of publishedInOrder(rows)) {
    const postUrl = normalizeInstagramPostUrl(row.postUrl);
    if (!postUrl || seen.has(postUrl)) continue;
    seen.add(postUrl);
    items.push({ key: row.id, postUrl, embedUrl: `${postUrl}embed` });
    if (items.length >= INSTAGRAM_LIMITS.max) break;
  }
  return items;
}

export type InstagramRawInput = {
  postUrl?: string | null;
  isPublished?: boolean;
};
export type InstagramData = {
  postUrl: string;
  isPublished: boolean;
};

export function validateInstagramInput(raw: InstagramRawInput): SimpleValidation<InstagramData> {
  if (!clean(raw.postUrl)) {
    return { ok: false, error: "URL postingan Instagram wajib diisi." };
  }
  const postUrl = normalizeInstagramPostUrl(raw.postUrl ?? "");
  if (!postUrl) {
    return {
      ok: false,
      error:
        "Bukan tautan postingan Instagram. Contoh yang valid: https://www.instagram.com/p/Cxxxx/",
    };
  }
  return { ok: true, data: { postUrl, isPublished: raw.isPublished ?? false } };
}
