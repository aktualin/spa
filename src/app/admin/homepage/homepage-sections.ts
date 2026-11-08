/**
 * Daftar key section homepage yang dikenali admin.
 *
 * Berisi konstanta (bukan Server Action), jadi file ini tidak memakai
 * `"use server"`. Baris section yang belum ada di database dibuat admin lewat
 * tombol "Tambahkan section". Status awalnya mengikuti tampilan homepage
 * sekarang, sehingga homepage publik tidak berubah saat baris dibuat:
 * - section bawaan (hero … booking-banner, footer) sudah tampil walau belum
 *   ada barisnya → dibuat AKTIF;
 * - section baru (signature-treatments, promo-highlight, gallery-teaser) →
 *   dibuat MATI sampai admin menyalakannya.
 * Lihat `isDefaultVisibleSection` di `@/lib/domain/homepage`.
 */

export const HOMEPAGE_SECTION_KEYS = [
  "hero",
  "membership-banner",
  "whats-new",
  "reviews",
  "brand-intro",
  "socials",
  "booking-banner",
  "signature-treatments",
  "promo-highlight",
  "gallery-teaser",
  "footer",
] as const;

export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number];

const KEY_LABEL: Record<string, string> = {
  hero: "Hero",
  "membership-banner": "Banner Membership",
  "whats-new": "What's New",
  reviews: "Reviews",
  "brand-intro": "Brand Intro",
  socials: "Socials",
  "booking-banner": "Banner Booking",
  "signature-treatments": "Signature Treatments",
  "promo-highlight": "Promo Highlight",
  "gallery-teaser": "Gallery Teaser",
  footer: "Footer",
};

export function sectionKeyLabel(key: string): string {
  return KEY_LABEL[key] ?? key;
}

/**
 * Asal konten section non-banner. Section ini tidak memakai isian teks/gambar
 * `HomepageSection` (hanya tampil/sembunyi & urutan), jadi admin diarahkan
 * ke tempat kontennya diatur.
 */
export const SECTION_SOURCE: Record<
  string,
  { text: string; link?: { href: string; label: string } }
> = {
  "whats-new": {
    text: "Kartu “What’s New” diatur di Highlight Homepage (gambar, label, judul, tautan, periode tampil).",
    link: { href: "/admin/homepage/highlights", label: "Kelola highlight" },
  },
  reviews: {
    text: "Kartu ulasan pelanggan diatur di Ulasan Pelanggan (isi, nama, lokasi, urutan, tampil/sembunyi). Judul section “Reviews” bersifat tetap.",
    link: { href: "/admin/homepage/reviews", label: "Kelola ulasan" },
  },
  "brand-intro": {
    text: "Kotak angka “KAMA at a glance” diatur di Statistik Brand Intro. Cerita lengkap brand diatur di halaman Our Story.",
    link: { href: "/admin/homepage/stats", label: "Kelola statistik" },
  },
  socials: {
    text: "Foto grid Instagram diatur di Feed Instagram (foto, teks alt, tautan, urutan). Username dan tautan profil diatur di Kontak & Umum.",
    link: { href: "/admin/homepage/instagram", label: "Kelola feed Instagram" },
  },
  "signature-treatments": {
    text: "Menampilkan hingga 6 treatment yang ditandai best seller di modul Treatments. Section tidak tampil bila belum ada.",
    link: { href: "/admin/treatments", label: "Buka Treatments" },
  },
  "promo-highlight": {
    text: "Menampilkan promo aktif pertama dari modul Promos; bila tidak ada, event terdekat dari modul Events.",
    link: { href: "/admin/promos", label: "Buka Promos" },
  },
  "gallery-teaser": {
    text: "Menampilkan foto dari modul Gallery (atau feed Instagram bila token tersedia).",
    link: { href: "/admin/gallery", label: "Buka Gallery" },
  },
  footer: {
    text: "Isi footer berlaku untuk seluruh situs (tautan footer diatur di Menu Navigasi). Saklar ini hanya menyembunyikan footer DI HOMEPAGE — halaman lain tetap menampilkan footer. Saat footer homepage dimatikan, tombol “Subscribe to Newsletter” di What’s New ikut disembunyikan karena tujuannya ada di footer. Footer selalu berada di paling bawah, jadi tidak ikut diurutkan.",
  },
};
