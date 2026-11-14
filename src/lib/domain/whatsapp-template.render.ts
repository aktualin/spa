/** Render & pengisian template pesan WhatsApp — lihat `whatsapp-template.ts`. */

export const PLACEHOLDER_RE = /\{\{\s*(\w+)\s*\}\}/g;

/** Batas panjang pesan template (karakter). */
export const MAX_TEMPLATE_LENGTH = 1000;

/** Mengganti `{{key}}` dengan nilainya. Placeholder yang tak dikenal dibiarkan. */
export function renderTemplate(
  template: string,
  values: Record<string, string | number | null | undefined> = {},
): string {
  return template.replace(PLACEHOLDER_RE, (match, key: string) => {
    const value = values[key];
    if (value === undefined || value === null) return match;
    return String(value);
  });
}

/** Daftar placeholder yang ada di dalam sebuah template. */
export function extractPlaceholders(template: string): string[] {
  const found = new Set<string>();
  for (const match of template.matchAll(PLACEHOLDER_RE)) {
    found.add(match[1]);
  }
  return [...found];
}

/**
 * Mengisi template untuk dikirim ke tamu: placeholder yang tak terisi
 * (tidak dikenal, `null`, atau kosong) dihapus, lalu spasi ganda dan spasi
 * sebelum tanda baca dirapikan. Baris baru dipertahankan.
 */
export function fillTemplate(
  template: string,
  values: Record<string, string | number | null | undefined> = {},
): string {
  const filled = template.replace(PLACEHOLDER_RE, (_match, key: string) => {
    const value = values[key];
    if (value === undefined || value === null) return "";
    return String(value).trim();
  });

  return filled
    .split("\n")
    .map((line) =>
      line
        .replace(/[ \t]{2,}/g, " ")
        .replace(/[ \t]+([,.!?;:])/g, "$1")
        .replace(/\(\s*\)/g, "")
        .replace(/[ \t]{2,}/g, " ")
        .trim(),
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Membangun URL `wa.me` dari pesan. Semua nomor harus digit saja.
 * Fungsi ini satu-satunya tempat yang membentuk tautan WhatsApp.
 */
export function buildWhatsAppLink(
  message: string,
  number: string,
): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Normalisasi nomor yang diisi admin menjadi format `wa.me` (digit, awalan 62).
 *
 * Admin biasa menulis `0813-1605-2040`, `+62 813 1605 2040`, atau `62813...`.
 * Mengembalikan `null` kalau hasilnya tidak masuk akal sebagai nomor Indonesia,
 * supaya pemanggil bisa jatuh ke nomor default alih-alih membuat link rusak.
 */
export function normalizeWaNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;

  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;

  if (!digits.startsWith("62")) return null;
  // 62 + 9..13 digit nomor seluler Indonesia.
  if (digits.length < 11 || digits.length > 15) return null;

  return digits;
}