/**
 * Ringkasan dashboard admin — logika murni (tanpa Prisma/Next.js) supaya bisa
 * diuji unit. Halaman dashboard yang menghitung angkanya dari database, lalu
 * berkas ini mengubah angka itu menjadi daftar "perlu perhatian".
 *
 * Prinsipnya: dashboard hanya menyebut hal yang bisa ditindaklanjuti admin
 * hari ini. Bila semuanya beres, daftarnya kosong dan dashboard mengatakannya
 * dengan jelas — bukan menampilkan deretan angka nol tanpa makna.
 *
 * Implementasinya dipecah ke berkas `admin-dashboard.*.ts` di folder ini;
 * berkas ini hanya mengekspor ulang simbol publiknya.
 */

export {
  PROMO_ENDING_SOON_DAYS,
  type AlertTone,
  type DashboardAlert,
  type ContentSpot,
  CONTENT_SPOTS,
  emptyContentSpots,
  type DashboardInput,
} from "./admin-dashboard.types.ts";
export { dashboardAlerts, promoEndingSoonRange } from "./admin-dashboard.alerts.ts";
export {
  type MonthBucket,
  type TrendPoint,
  monthBuckets,
  monthlyTrend,
} from "./admin-dashboard.charts.ts";
export {
  type JournalStatusKey,
  type JournalStatusSegment,
  journalStatusSegments,
} from "./admin-dashboard.journal.ts";