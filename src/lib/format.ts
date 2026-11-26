const idrFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

/** 145000 → "Rp 145,000" (English grouping, brand "Rp" prefix). */
export function formatIdr(amount: number): string {
  return `Rp ${idrFormatter.format(amount)}`;
}
