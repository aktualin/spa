import {
  canAccessAdminPath,
  findAccessRule,
  rolesForAdminPath,
  visibleModules,
  type AccessChild,
} from "../../lib/domain/admin-access.ts";
import {
  ADMIN_ONLY_ROLES,
  CONTENT_ROLES,
  type AdminRoleName,
} from "../../lib/domain/roles.ts";

/**
 * Modul dashboard (14 modul Lampiran I Bagian D kontrak 01/PKS/XI/KAMA/2026
 * ditambah modul pendukung). SUMBER TUNGGAL untuk:
 * - matriks role → modul (sidebar, kartu dashboard, guard halaman);
 * - progres build (`ready`).
 *
 * Matriks akses:
 * - ADMIN & EDITOR (CONTENT_ROLES): semua modul konten — treatment, harga,
 *   gallery, media, promo, membership, journal, events, retail, corporate,
 *   homepage, halaman & URL, menu navigasi, SEO per halaman.
 * - ADMIN saja (ADMIN_ONLY_ROLES): modul pengaturan sistem —
 *   - Pengguna Admin: membuat akun & memberi role = bisa menaikkan hak akses.
 *   - Kontak & Umum (termasuk Template WhatsApp): nomor WhatsApp, email,
 *     tautan booking, ID Google Analytics, verifikasi Search Console, favicon.
 *     Satu salah isi merusak semua tombol booking/WhatsApp atau pelacakan di
 *     seluruh situs, dan ID GA4/GSC menyuntikkan skrip pihak ketiga.
 *   - Backup & Status: mengunduh salinan database (berisi data inquiry dan
 *     data pribadi) serta melihat status sistem.
 * SEO per halaman tetap untuk EDITOR karena isinya teks judul/deskripsi yang
 * ditulis bersama kontennya; pengaturan SEO global (GA4/GSC/OG bawaan) ada di
 * Kontak & Umum yang khusus ADMIN.
 *
 * Path admin yang tidak tercakup modul mana pun dianggap khusus ADMIN
 * (fail-closed) — daftarkan halaman baru di sini. Logika pencocokan path:
 * src/lib/domain/admin-access.ts.
 */
export type AdminModule = {
  /** Nomor modul di Lampiran I Bagian D (15+ = modul tambahan). Harus unik. */
  no: number;
  label: string;
  href: string;
  /** Role yang boleh membuka modul ini (sidebar + halaman + Server Action). */
  roles: readonly AdminRoleName[];
  /** false selama halamannya belum dibangun — sidebar menandainya "segera". */
  ready: boolean;
  /** Sub-halaman modul; `roles` kosong = ikut modul induk. */
  children?: AccessChild[];
};

export const ADMIN_MODULES: readonly AdminModule[] = [
  {
    no: 1,
    label: "Treatments & Packages",
    href: "/admin/treatments",
    roles: CONTENT_ROLES,
    ready: true,
    children: [
      { label: "Add-on", href: "/admin/treatments/addons" },
      { label: "Kategori", href: "/admin/treatments/categories" },
      { label: "Packages", href: "/admin/treatments/packages" },
    ],
  },
  {
    no: 2,
    label: "Harga",
    href: "/admin/treatments/prices",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 3,
    label: "Foto & Gallery",
    href: "/admin/gallery",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 16 hanya penanda unik.
    no: 16,
    label: "Media Library",
    href: "/admin/media",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 4,
    label: "Promos & Gift Card",
    href: "/admin/promos",
    roles: CONTENT_ROLES,
    ready: true,
    children: [{ label: "Gift Card", href: "/admin/gift-card" }],
  },
  {
    no: 5,
    label: "Membership",
    href: "/admin/membership",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 6,
    label: "Journal",
    href: "/admin/journal",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 7,
    label: "Events",
    href: "/admin/events",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 8,
    label: "KAMA Retail",
    href: "/admin/retail",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 9,
    label: "Corporate Wellness",
    href: "/admin/corporate",
    roles: CONTENT_ROLES,
    ready: true,
    children: [
      { label: "Konten halaman", href: "/admin/corporate/content" },
      { label: "PIC", href: "/admin/corporate/pic" },
      { label: "Inquiries", href: "/admin/corporate/inquiries" },
    ],
  },
  {
    no: 10,
    label: "Homepage & Our Story",
    href: "/admin/homepage",
    roles: CONTENT_ROLES,
    ready: true,
    children: [
      { label: "Highlight", href: "/admin/homepage/highlights" },
      { label: "Statistik", href: "/admin/homepage/stats" },
      { label: "Ulasan", href: "/admin/homepage/reviews" },
      { label: "Feed Instagram", href: "/admin/homepage/instagram" },
      { label: "Our Story", href: "/admin/our-story" },
    ],
  },
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 15 hanya penanda unik.
    no: 15,
    label: "Halaman & URL",
    href: "/admin/pages",
    roles: CONTENT_ROLES,
    ready: true,
    children: [{ label: "Redirect 301", href: "/admin/redirects" }],
  },
  {
    no: 11,
    label: "Menu Navigasi",
    href: "/admin/menu",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 12,
    label: "Kontak & Umum",
    href: "/admin/settings/contact",
    roles: ADMIN_ONLY_ROLES,
    ready: true,
    children: [{ label: "Template WhatsApp", href: "/admin/settings/whatsapp" }],
  },
  {
    no: 13,
    label: "SEO",
    href: "/admin/seo",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 14,
    label: "Pengguna Admin",
    href: "/admin/users",
    roles: ADMIN_ONLY_ROLES,
    ready: true,
  },
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 19 mengikuti
    // penanda "Modul 19" di prisma/schema.prisma (BackupRun).
    no: 19,
    label: "Backup & Status",
    href: "/admin/status",
    roles: ADMIN_ONLY_ROLES,
    ready: true,
  },
];

/** Modul (beserta sub-menu) yang boleh tampil untuk role tertentu. */
export function modulesForRole(role: AdminRoleName): AdminModule[] {
  return visibleModules(ADMIN_MODULES, role);
}

/** Role yang boleh membuka path admin (path tak terdaftar → ADMIN saja). */
export function rolesForPath(pathname: string): readonly AdminRoleName[] {
  return rolesForAdminPath(ADMIN_MODULES, pathname);
}

export function canAccessPath(role: AdminRoleName, pathname: string): boolean {
  return canAccessAdminPath(ADMIN_MODULES, role, pathname);
}

/** Nama modul untuk path admin (dipakai pesan "akses ditolak"), atau null. */
export function moduleLabelForPath(pathname: string): string | null {
  return findAccessRule(ADMIN_MODULES, pathname)?.label ?? null;
}
