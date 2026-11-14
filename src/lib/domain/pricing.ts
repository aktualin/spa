/**
 * Aturan harga & durasi.
 *
 * Harga di database disimpan sebagai Int rupiah penuh (tanpa desimal), sesuai
 * DoD modul Harga. Form admin mengetik angka polos, misalnya `145000`.
 * Implementasinya dipecah ke `pricing.parse.ts` dan `pricing.format.ts`;
 * berkas ini hanya mengekspor ulang simbol publiknya.
 */

export {
  InvalidPriceError,
  MAX_PRICE_IDR,
  parsePriceIdr,
  parseOptionalPriceIdr,
  tryParsePriceIdr,
  parseDurationMin,
} from "./pricing.parse.ts";
export {
  formatDuration,
  parsePriceLabel,
  parseDurationLabel,
  formatMembershipPriceLabel,
  formatPriceLabel,
} from "./pricing.format.ts";