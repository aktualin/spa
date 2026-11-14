/**
 * Konstanta kalender WIB (UTC+7 tetap, tanpa DST) yang dipakai bersama oleh
 * grafik dashboard, analitik pengunjung, dan aturan tanggal event, supaya
 * semua perhitungan "hari ini" memakai zona yang sama.
 */

export const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Label bulan pendek gaya Indonesia untuk sumbu grafik. */
export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;