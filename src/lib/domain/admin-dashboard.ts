/**
 * Ringkasan dashboard admin — logika murni (tanpa Prisma/Next.js) supaya bisa
 * diuji unit. Halaman dashboard yang menghitung angkanya dari database, lalu
 * berkas ini mengubah angka itu menjadi daftar "perlu perhatian".
 *
 * Prinsipnya: dashboard hanya menyebut hal yang bisa ditindaklanjuti admin
 * hari ini. Bila semuanya beres, daftarnya kosong dan dashboard mengatakannya
 * dengan jelas — bukan menampilkan deretan angka nol tanpa makna.
 */

import { type AutoBackupHealth } from "./backup.ts";

/** Promo dianggap "akan berakhir" bila endDate dalam rentang hari ini. */
export const PROMO_ENDING_SOON_DAYS = 7;

export type AlertTone = "attention" | "info";

export type DashboardAlert = {
  id: string;
  label: string;
  detail: string;
  href: string;
  tone: AlertTone;
  count?: number;
};

/**
 * Tempat konten yang kosongnya terlihat pengunjung. `href` menunjuk modul yang
 * mengisinya. Sengaja hanya memuat konten yang membuat bagian situs hilang
 * atau tampil tanpa isi — bukan setiap tabel.
 */
export type ContentSpot = {
  key: string;
  label: string;
  href: string;
};

export const CONTENT_SPOTS: readonly ContentSpot[] = [
  { key: "homepageHighlight", label: "What's New di homepage", href: "/admin/homepage/highlights" },
  { key: "homepageReview", label: "Ulasan di homepage", href: "/admin/homepage/reviews" },
  { key: "homepageStat", label: "Statistik brand di homepage", href: "/admin/homepage/stats" },
  { key: "instagramPost", label: "Feed Instagram", href: "/admin/homepage/instagram" },
  { key: "contentBlock", label: "Teks halaman (judul section & label tombol)", href: "/admin/page-copy" },
  { key: "branch", label: "Daftar cabang di halaman Contact", href: "/admin/branches" },
  { key: "galleryPhoto", label: "Foto galeri", href: "/admin/gallery" },
  { key: "retailProduct", label: "Produk KAMA Retail", href: "/admin/retail" },
  { key: "menuItem", label: "Menu navigasi header & footer", href: "/admin/menu" },
  { key: "staticPage", label: "Halaman di modul Halaman & URL", href: "/admin/pages" },
];

/** Tempat konten yang masih nol baris, mengikuti urutan `CONTENT_SPOTS`. */
export function emptyContentSpots(
  counts: Readonly<Record<string, number>>,
  spots: readonly ContentSpot[] = CONTENT_SPOTS,
): ContentSpot[] {
  return spots.filter((spot) => (counts[spot.key] ?? 0) === 0);
}

export type DashboardInput = {
  /** Inquiry Corporate Wellness berstatus NEW. */
  inquiriesNew: number;
  /** Artikel berstatus SCHEDULED yang waktu terbitnya masih di depan. */
  journalScheduled: number;
  /** Artikel SCHEDULED yang waktu terbitnya sudah lewat tapi belum terbit. */
  journalOverdue: number;
  /** Promo terbit yang endDate-nya jatuh dalam PROMO_ENDING_SOON_DAYS hari. */
  promosEndingSoon: number;
  emptyContent: readonly ContentSpot[];
  /**
   * Status backup otomatis; null untuk role yang tidak berhak melihatnya
   * (modul Backup & Status khusus ADMIN).
   */
  backup: AutoBackupHealth | null;
};

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
