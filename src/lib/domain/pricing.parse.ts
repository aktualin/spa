/** Parsing harga & durasi dari form admin — lihat `pricing.ts`. */

export class InvalidPriceError extends Error {}

/**
 * Batas atas harga. Kolom harga bertipe Int (32-bit), jadi nilai di atas
 * ~2,1 miliar gagal disimpan; 1 miliar sudah jauh di atas harga mana pun.
 */
export const MAX_PRICE_IDR = 1_000_000_000;

function checkRange(value: number): number {
  if (value < 0) throw new InvalidPriceError("Harga tidak boleh negatif.");
  if (value > MAX_PRICE_IDR) {
    throw new InvalidPriceError("Harga terlalu besar (maksimal Rp 1.000.000.000).");
  }
  return value;
}

/**
 * Mengubah input form menjadi rupiah penuh.
 * Menerima "145000", "145000", 145000, dan "145.000".
 * Menolak nilai negatif, pecahan, dan teks non-numerik.
 */
export function parsePriceIdr(input: string | number): number {
  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      throw new InvalidPriceError("Harga harus berupa angka.");
    }
    if (!Number.isInteger(input)) {
      throw new InvalidPriceError("Harga harus bilangan bulat tanpa desimal.");
    }
    return checkRange(input);
  }

  const trimmed = input.trim();
  if (trimmed === "") throw new InvalidPriceError("Harga wajib diisi.");
  if (trimmed.startsWith("-")) {
    throw new InvalidPriceError("Harga tidak boleh negatif.");
  }

  // Buang simbol mata uang/spasi, sisakan angka dan pemisah ribuan.
  const cleaned = trimmed.replace(/[^\d.,]/g, "");
  if (cleaned === "") throw new InvalidPriceError("Harga harus berupa angka.");

  // Pemisah ribuan: grup tepat tiga digit ("145.000", "1.500.000", "145,000").
  const isThousands = /^\d{1,3}([.,]\d{3})+$/.test(cleaned);
  const normalized = isThousands ? cleaned.replace(/[.,]/g, "") : cleaned;

  const value = Number(isThousands ? normalized : normalized.replace(",", "."));
  if (!Number.isFinite(value)) {
    throw new InvalidPriceError("Harga harus berupa angka.");
  }
  if (!Number.isInteger(value)) {
    throw new InvalidPriceError("Harga harus bilangan bulat tanpa desimal.");
  }
  return checkRange(value);
}

/** Seperti `parsePriceIdr`, tetapi isian kosong berarti "tanpa harga" (null). */
export function parseOptionalPriceIdr(input: string): number | null {
  return input.trim() === "" ? null : parsePriceIdr(input);
}

/** Sama seperti `parsePriceIdr` tetapi mengembalikan null bila tidak valid. */
export function tryParsePriceIdr(input: string | number): number | null {
  try {
    return parsePriceIdr(input);
  } catch {
    return null;
  }
}

/** Durasi dalam menit harus bilangan bulat positif. */
export function parseDurationMin(input: string | number): number {
  const raw = typeof input === "number" ? input : input.trim();
  if (raw === "") throw new InvalidPriceError("Durasi wajib diisi.");

  const value = Number(raw);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new InvalidPriceError("Durasi harus bilangan bulat menit.");
  }
  if (value <= 0) {
    throw new InvalidPriceError("Durasi harus lebih dari 0 menit.");
  }
  return value;
}