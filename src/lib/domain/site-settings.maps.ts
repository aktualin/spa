/** URL Google Maps (embed & rute) — lihat `site-settings.ts`. */

const MAPS_EMBED_PREFIX = "https://www.google.com/maps/embed?";

/**
 * Ambil URL embed Google Maps dari isian admin.
 *
 * Admin boleh menempel URL langsung atau seluruh kode `<iframe …>` dari menu
 * Share → Embed a map; untuk iframe hanya atribut `src` yang diambil. Hasilnya
 * wajib diawali `https://www.google.com/maps/embed?` dan tidak memuat HTML.
 * Mengembalikan `null` bila tidak valid.
 */
export function parseMapsEmbedInput(input: string): string | null {
  let value = input.trim();
  if (!value) return null;

  if (/<\s*iframe\b/i.test(value)) {
    const match = value.match(/\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    if (!match) return null;
    value = (match[1] ?? match[2] ?? "").trim().replace(/&amp;/g, "&");
  }

  if (/[<>"'\s]/.test(value)) return null;
  if (!value.startsWith(MAPS_EMBED_PREFIX)) return null;

  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "www.google.com" ||
      url.pathname !== "/maps/embed" ||
      url.search.length <= 1
    ) {
      return null;
    }
  } catch {
    return null;
  }
  return value;
}

/** Tautan rute Google Maps ke sebuah alamat. */
export function directionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}