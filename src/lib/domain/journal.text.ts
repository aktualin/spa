/** Teks editor & panjang meta SEO journal — lihat `journal.ts`. */

/** Isi editor kosong (mis. hanya `<p><br></p>`) — tanpa teks maupun gambar. */
export function isRichTextEmpty(html: string): boolean {
  if (/<(img|iframe|video)\b/i.test(html)) return false;
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .trim();
  return text.length === 0;
}

export type SeoLengthState = "empty" | "short" | "ideal" | "long";

/**
 * Penilaian panjang meta SEO terhadap panjang idealnya: di bawah ±50% →
 * "short", sampai batas ideal → "ideal", lebih dari itu → "long" (terpotong).
 */
export function seoLengthState(length: number, ideal: number): SeoLengthState {
  if (length === 0) return "empty";
  if (length > ideal) return "long";
  if (length < Math.round(ideal / 2)) return "short";
  return "ideal";
}