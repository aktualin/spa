const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** 145000 → "Rp 145.000" */
export function formatIdr(amount: number): string {
  // Intl menempelkan simbol tanpa spasi ("Rp145.000"); beri spasi agar terbaca.
  return idrFormatter.format(amount).replace(/^Rp\s?/, "Rp ");
}
