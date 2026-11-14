/** Tipe & tempat konten dashboard admin — lihat `admin-dashboard.ts`. */
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