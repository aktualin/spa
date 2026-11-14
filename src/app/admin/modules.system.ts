import { ADMIN_ONLY_ROLES, CONTENT_ROLES } from "../../lib/domain/roles.ts";

import type { AdminModule } from "./modules.types.ts";

/** Modul kelompok "Halaman & Navigasi", "Analitik", dan "Pengaturan Sistem". */
export const SYSTEM_MODULES: readonly AdminModule[] = [
  {
    no: 11,
    label: "Menu Navigasi",
    href: "/admin/menu",
    group: "struktur",
    hint: "Tautan di header, mega-menu, menu mobile, dan footer.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 15 hanya penanda unik.
    no: 15,
    label: "Halaman & URL",
    href: "/admin/pages",
    group: "struktur",
    hint: "Slug, judul, SEO, dan status terbit tiap halaman publik, plus redirect 301.",
    roles: CONTENT_ROLES,
    ready: true,
    children: [{ label: "Redirect 301", href: "/admin/redirects" }],
  },
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 18 hanya penanda unik.
    no: 18,
    label: "Teks Halaman",
    href: "/admin/page-copy",
    group: "struktur",
    hint: "Judul section, label tombol, dan teks pendek yang tersebar di seluruh halaman.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 17 hanya penanda unik.
    no: 17,
    label: "Cabang",
    href: "/admin/branches",
    group: "struktur",
    hint: "Daftar cabang di halaman Contact dan pilihan cabang pada form.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 13,
    label: "SEO",
    href: "/admin/seo",
    group: "struktur",
    hint: "Meta title, description, dan OG image per halaman.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 20 hanya penanda unik.
    no: 20,
    label: "Pengunjung & Halaman",
    href: "/admin/analytics",
    group: "analitik",
    hint: "Jumlah pengunjung unik, tampilan halaman, dan halaman publik yang paling banyak diakses.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 12,
    label: "Kontak & Umum",
    href: "/admin/settings/contact",
    group: "sistem",
    hint: "Nomor WhatsApp, email, tautan booking, ikon sosial, GA4, dan favicon — dipakai seluruh situs.",
    roles: ADMIN_ONLY_ROLES,
    ready: true,
    children: [{ label: "Template WhatsApp", href: "/admin/settings/whatsapp" }],
  },
  {
    no: 14,
    label: "Pengguna Admin",
    href: "/admin/users",
    group: "sistem",
    hint: "Akun dan role yang bisa masuk dashboard ini. Tidak tampil di situs publik.",
    roles: ADMIN_ONLY_ROLES,
    ready: true,
  },
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 19 mengikuti
    // penanda "Modul 19" di prisma/schema.prisma (BackupRun).
    no: 19,
    label: "Backup & Status",
    href: "/admin/status",
    group: "sistem",
    hint: "Salinan database dan status sistem. Tidak tampil di situs publik.",
    roles: ADMIN_ONLY_ROLES,
    ready: true,
  },
];