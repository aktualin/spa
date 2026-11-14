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
    text: "Kartu “What’s New” diatur di Highlight Homepage (gambar, label, judul, tautan, periode tampil). Judul section, deskripsi, dan tombol diisi di bawah ini — bagian yang dikosongkan tidak tampil di homepage.",
    link: { href: "/admin/homepage/highlights", label: "Kelola highlight" },
  },
  reviews: {
    text: "Kartu ulasan pelanggan diatur di Ulasan Pelanggan (isi, nama, lokasi, urutan, tampil/sembunyi). Judul section diisi di bawah ini.",
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