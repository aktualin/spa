import { isPromoActive } from "@/lib/domain/visibility";

/**
 * Status tampilan untuk list promo:
 * - Draf         → belum dipublikasikan
 * - Aktif        → published dan berada dalam periode
 * - Terjadwal    → published tapi periode belum mulai
 * - Kedaluwarsa  → published tapi periode sudah lewat
 */
export function promoStatus(promo: {
  isPublished: boolean;
  startDate: Date | null;
  endDate: Date | null;
}): "Draf" | "Aktif" | "Terjadwal" | "Kedaluwarsa" {
  if (!promo.isPublished) return "Draf";

  const now = new Date();
  if (isPromoActive(promo, now)) return "Aktif";
  if (promo.startDate && promo.startDate.getTime() > now.getTime()) {
    return "Terjadwal";
  }
  return "Kedaluwarsa";
}

export const promoStatusTone: Record<
  ReturnType<typeof promoStatus>,
  "muted" | "green" | "blue" | "red"
> = {
  Draf: "muted",
  Aktif: "green",
  Terjadwal: "blue",
  Kedaluwarsa: "red",
};
