/** Normalisasi & validasi nomor telepon/WhatsApp — lihat `site-settings.ts`. */

/**
 * Normalisasi nomor WhatsApp ke format internasional digit saja.
 *
 * - `0813…` → `62813…`; `813…` → `62813…`; `+62 813…` / `62813…` tetap.
 * - Awalan internasional `00` dibuang (`0062…` → `62…`).
 * - Nomor negara lain yang ditulis dengan `+` dipertahankan apa adanya.
 *
 * Mengembalikan `null` bila ada karakter selain angka, `+`, spasi, titik,
 * tanda hubung, atau kurung, atau bila panjang hasilnya di luar 8–15 digit.
 */
export function normalizeWhatsAppNumber(input: string): string | null {
  const raw = input.trim();
  if (!raw || !/^\+?[0-9\s().-]+$/.test(raw)) return null;

  let digits = raw.replace(/\D/g, "");
  const international = raw.startsWith("+");
  if (!international) {
    if (digits.startsWith("00")) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
    else if (digits.startsWith("8")) digits = `62${digits}`;
  }

  if (digits.startsWith("0")) return null;
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

/**
 * Format tampilan nomor: `6281316052040` → `+62 813-1605-2040`.
 * Nomor non-Indonesia cukup diberi awalan `+`.
 */
export function formatPhoneDisplay(digits: string): string {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return "";
  if (!clean.startsWith("62") || clean.length < 9) return `+${clean}`;
  const local = clean.slice(2);
  const groups = [local.slice(0, 3), local.slice(3, 7), local.slice(7)].filter(
    Boolean,
  );
  return `+62 ${groups.join("-")}`;
}

/** Nomor telepon biasa: boleh angka, `+`, spasi, titik, tanda hubung, kurung. */
export function isValidPhone(input: string): boolean {
  const raw = input.trim();
  if (!/^\+?[0-9\s().-]+$/.test(raw)) return false;
  const digits = raw.replace(/\D/g, "").length;
  return digits >= 8 && digits <= 15;
}