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
}): "Draft" | "Active" | "Scheduled" | "Expired" {
  if (!promo.isPublished) return "Draft";

  const now = new Date();
  if (isPromoActive(promo, now)) return "Active";
  if (promo.startDate && promo.startDate.getTime() > now.getTime()) {
    return "Scheduled";
  }
  return "Expired";
}

export const promoStatusTone: Record<
  ReturnType<typeof promoStatus>,
  "muted" | "green" | "blue" | "red"
> = {
  Draft: "muted",
  Active: "green",
  Scheduled: "blue",
  Expired: "red",
};
