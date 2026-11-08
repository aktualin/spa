/**
 * Aturan harga & durasi.
 *
 * Harga di database disimpan sebagai Int rupiah penuh (tanpa desimal), sesuai
 * DoD modul Harga. Form admin mengetik angka polos, misalnya `145000`.
 */

export class InvalidPriceError extends Error {}

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
    if (input < 0) {
      throw new InvalidPriceError("Harga tidak boleh negatif.");
    }
    return input;
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
  if (value < 0) {
    throw new InvalidPriceError("Harga tidak boleh negatif.");
  }
  return value;
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

/** 90 → "90 menit", 120 → "2 jam". */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "";
  if (minutes < 60) return `${minutes} menit`;
  const hours = minutes / 60;
  const label = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  return `${label} jam`;
}

/**
 * Label harga gaya konten statis → rupiah penuh.
 * "145k" → 145000, "1.5jt" → 1500000, "650rb" → 650000. Tidak valid → 0.
 *
 * Pemisah ribuan ("145.000") dikenali kalau dikelompokkan tepat tiga digit;
 * selain itu titik/koma dibaca sebagai desimal ("1.5jt" = 1.500.000).
 */
export function parsePriceLabel(raw: string): number {
  const cleaned = raw.trim().replace(/^rp\s*/i, "");
  const match = /^([\d.,]+)\s*(k|rb|jt)?$/i.exec(cleaned);
  if (!match) return 0;

  const digits = match[1];
  const isThousands = /^\d{1,3}([.,]\d{3})+$/.test(digits);
  const amount = Number.parseFloat(
    isThousands ? digits.replace(/[.,]/g, "") : digits.replace(",", "."),
  );
  if (Number.isNaN(amount)) return 0;

  switch (match[2]?.toLowerCase()) {
    case "k":
    case "rb":
      return Math.round(amount * 1_000);
    case "jt":
      return Math.round(amount * 1_000_000);
    default:
      return Math.round(amount);
  }
}

/**
 * Label durasi gaya konten statis → menit.
 * "60 min" → 60, "2 hours" → 120, "2 hours 30 minute" → 150. Tidak valid → 0.
 */
export function parseDurationLabel(raw: string): number {
  const cleaned = raw.trim().toLowerCase();
  const hours = /([\d.]+)\s*(?:hours?|jam)/.exec(cleaned);
  const mins = /([\d.]+)\s*(?:min(?:ute)?s?|menit)/.exec(cleaned);
  const total =
    (hours ? Number.parseFloat(hours[1]) * 60 : 0) +
    (mins ? Number.parseFloat(mins[1]) : 0);
  return Number.isFinite(total) ? Math.round(total) : 0;
}
