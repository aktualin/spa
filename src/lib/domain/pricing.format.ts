/** Format & parsing label harga/durasi gaya konten statis — lihat `pricing.ts`. */

/** 90 → "90 minutes", 120 → "2 hours", 60 → "1 hour". */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  const hours = minutes / 60;
  const label = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  return `${label} ${label === "1" ? "hour" : "hours"}`;
}

/**
 * Label harga gaya konten statis → rupiah penuh.
 * "145k" → 145000, "1.5jt" → 1500000, "650rb" → 650000, "1.5 million" → 1500000. Tidak valid → 0.
 *
 * Pemisah ribuan ("145.000") dikenali kalau dikelompokkan tepat tiga digit;
 * selain itu titik/koma dibaca sebagai desimal ("1.5jt" = 1.500.000).
 */
export function parsePriceLabel(raw: string): number {
  const cleaned = raw.trim().replace(/^rp\s*/i, "");
  const match = /^([\d.,]+)\s*(k|rb|jt|million|m)?$/i.exec(cleaned);
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
    case "million":
    case "m":
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

/**
 * Rupiah penuh → label harga gaya halaman Membership (format IDR penuh):
 * 1500000 → "Rp 1,500,000", 750000 → "Rp 750,000", 1250 → "Rp 1,250".
 */
export function formatMembershipPriceLabel(priceIdr: number): string {
  return `Rp ${priceIdr.toLocaleString("en-US")}`;
}

/** Rupiah penuh → label harga gaya halaman /menu: 145000 → "145k". */
export function formatPriceLabel(priceIdr: number): string {
  return priceIdr % 1000 === 0 ? `${priceIdr / 1000}k` : String(priceIdr);
}