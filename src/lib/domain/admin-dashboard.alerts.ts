/** Daftar "perlu perhatian" dashboard admin — lihat `admin-dashboard.ts`. */
import {
  type DashboardAlert,
  type DashboardInput,
  PROMO_ENDING_SOON_DAYS,
} from "./admin-dashboard.types.ts";

/**
 * Daftar "perlu perhatian", paling mendesak di atas. Hal yang sudah beres
 * tidak muncul sama sekali.
 */
export function dashboardAlerts(input: DashboardInput): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  if (input.journalOverdue > 0) {
    alerts.push({
      id: "journal-overdue",
      label: "Artikel terjadwal lewat waktu",
      detail:
        "Waktu terbitnya sudah lewat tapi statusnya masih terjadwal. Ubah ke published agar muncul di situs.",
      href: "/admin/journal",
      tone: "attention",
      count: input.journalOverdue,
    });
  }

  if (input.backup === "never" || input.backup === "stale") {
    alerts.push({
      id: "backup",
      label: input.backup === "never" ? "Backup otomatis belum pernah berhasil" : "Backup otomatis terlambat",
      detail:
        input.backup === "never"
          ? "Belum ada catatan backup otomatis yang sukses. Periksa secret dan workflow backup."
          : "Backup otomatis terakhir yang sukses sudah lewat dari jadwal mingguan.",
      href: "/admin/status",
      tone: "attention",
    });
  }

  if (input.inquiriesNew > 0) {
    alerts.push({
      id: "inquiries",
      label: "Inquiry corporate baru",
      detail: "Belum ditindaklanjuti.",
      href: "/admin/corporate/inquiries",
      tone: "attention",
      count: input.inquiriesNew,
    });
  }

  if (input.promosEndingSoon > 0) {
    alerts.push({
      id: "promos-ending",
      label: `Promo berakhir dalam ${PROMO_ENDING_SOON_DAYS} hari`,
      detail: "Perpanjang tanggalnya atau siapkan penggantinya sebelum hilang dari situs.",
      href: "/admin/promos",
      tone: "info",
      count: input.promosEndingSoon,
    });
  }

  if (input.journalScheduled > 0) {
    alerts.push({
      id: "journal-scheduled",
      label: "Artikel menunggu jadwal terbit",
      detail: "Akan terbit sendiri saat waktunya tiba.",
      href: "/admin/journal",
      tone: "info",
      count: input.journalScheduled,
    });
  }

  for (const spot of input.emptyContent) {
    alerts.push({
      id: `empty-${spot.key}`,
      label: `Belum ada isi: ${spot.label}`,
      detail: "Bagian ini disembunyikan atau tampil kosong di situs selama tabelnya belum diisi.",
      href: spot.href,
      tone: "info",
    });
  }

  return alerts;
}

/** Rentang endDate untuk promo yang akan berakhir (dipakai query Prisma). */
export function promoEndingSoonRange(
  now: Date,
  days = PROMO_ENDING_SOON_DAYS,
): { gte: Date; lte: Date } {
  return { gte: now, lte: new Date(now.getTime() + days * 24 * 60 * 60 * 1000) };
}