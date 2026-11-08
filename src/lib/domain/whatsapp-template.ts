/**
 * Template pesan WhatsApp.
 *
 * Admin dapat mengatur template pesan per konteks (default, treatment, promo,
 * retail, dst) di modul Kontak & Umum. Template boleh memuat placeholder
 * seperti `{{nama}}` atau `{{harga}}`.
 */

/** Mengganti `{{key}}` dengan nilainya. Placeholder yang tak dikenal dibiarkan. */
export function renderTemplate(
  template: string,
  values: Record<string, string | number | null | undefined> = {},
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
    const value = values[key];
    if (value === undefined || value === null) return match;
    return String(value);
  });
}

/** Daftar placeholder yang ada di dalam sebuah template. */
export function extractPlaceholders(template: string): string[] {
  const found = new Set<string>();
  for (const match of template.matchAll(/\{\{\s*(\w+)\s*\}\}/g)) {
    found.add(match[1]);
  }
  return [...found];
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
