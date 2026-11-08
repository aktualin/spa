/**
 * Normalisasi nomor WhatsApp.
 *
 * Nomor disimpan sebagai digit saja agar aman dipakai pada `wa.me`. Awalan
 * `08` (format Indonesia) diubah menjadi `628`.
 */
export function normalizeWhatsAppNumber(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return `62${digits}`;
}
