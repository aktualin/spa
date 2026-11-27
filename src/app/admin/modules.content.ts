import { CONTENT_ROLES } from "../../lib/domain/roles.ts";

import type { AdminModule } from "./modules.types.ts";

/** Modul kelompok "Konten Situs". */
export const CONTENT_MODULES: readonly AdminModule[] = [
  {
    no: 10,
    label: "Homepage & Our Story",
    href: "/admin/homepage",
    group: "konten",
    hint: "Susunan section homepage, hero, statistik, feed Instagram, dan halaman Our Story.",
    roles: CONTENT_ROLES,
    ready: true,
    children: [
      { label: "Highlight", href: "/admin/homepage/highlights" },
      { label: "Statistik", href: "/admin/homepage/stats" },
      { label: "Feed Instagram", href: "/admin/homepage/instagram" },
      { label: "Our Story", href: "/admin/our-story" },
    ],
  },
  {
    no: 6,
    label: "Journal",
    href: "/admin/journal",
    group: "konten",
    hint: "Artikel di halaman Journal dan kartu What's New di homepage.",
    roles: CONTENT_ROLES,
    ready: true,
    children: [{ label: "Kategori", href: "/admin/journal/categories" }],
  },
  {
    no: 3,
    label: "Foto & Gallery",
    href: "/admin/gallery",
    group: "konten",
    hint: "Halaman Gallery dan section Gallery Teaser di homepage.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 9,
    label: "Corporate Wellness",
    href: "/admin/corporate",
    group: "konten",
    hint: "Halaman Corporate Wellness beserta form dan daftar inquiry yang masuk.",
    roles: CONTENT_ROLES,
    ready: true,
    children: [
      { label: "Inquiries", href: "/admin/corporate/inquiries" },
      { label: "PIC", href: "/admin/corporate/pic" },
      { label: "Konten halaman", href: "/admin/corporate/content" },
    ],
  },
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 22 hanya penanda unik.
    no: 22,
    label: "Reservasi",
    href: "/admin/reservations",
    group: "konten",
    hint: "Permintaan reservasi dari form publik (/contact & /reservation) beserta status tindak lanjutnya.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 16 hanya penanda unik.
    no: 16,
    label: "Media Library",
    href: "/admin/media",
    group: "konten",
    hint: "Gudang gambar yang dipakai modul lain lewat tombol “Pilih dari media”.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  // Modul kontrak no. 4 (Promos & Gift Card, termasuk anak /admin/gift-card)
  // dan no. 7 (Events) sengaja tidak didaftarkan: menu dihapus dari sidebar
  // per 27 Nov 2026. Halamannya masih ada dan fail-closed khusus ADMIN
  // (lihat modules.ts).
];