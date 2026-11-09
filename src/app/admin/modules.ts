import {
  activeAdminHref,
  canAccessAdminPath,
  findAccessRule,
  groupModules,
  rolesForAdminPath,
  visibleModules,
  type AccessChild,
  type AccessGroup,
  type GroupedModules,
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
  /** Kelompok sidebar; id harus ada di `ADMIN_GROUPS`. */
  group: string;
  /**
   * Satu kalimat: konten modul ini tampil di mana pada situs publik. Dipakai
   * sidebar (tooltip), kartu dashboard, dan petunjuk di atas halaman modul.
   */
  hint: string;
  /** Role yang boleh membuka modul ini (sidebar + halaman + Server Action). */
  roles: readonly AdminRoleName[];
  /** false selama halamannya belum dibangun — sidebar menandainya "segera". */
  ready: boolean;
  /** Sub-halaman modul; `roles` kosong = ikut modul induk. */
  children?: AccessChild[];
};

export const ADMIN_GROUPS: readonly AccessGroup[] = [
  { id: "katalog", label: "Katalog & Harga" },
  { id: "konten", label: "Konten Situs" },
  { id: "struktur", label: "Struktur & Halaman" },
  { id: "sistem", label: "Pengaturan Sistem" },
];

export const ADMIN_MODULES: readonly AdminModule[] = [
  {
    no: 1,
    label: "Treatments & Packages",
    href: "/admin/treatments",
    group: "katalog",
    hint: "Tampil di halaman Treatments, Menu, dan Signature Treatments di homepage.",
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
    group: "katalog",
    hint: "Harga yang tampil di kartu treatment, paket, dan halaman Menu.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 5,
    label: "Membership",
    href: "/admin/membership",
    group: "katalog",
    hint: "Halaman Membership, banner membership di homepage, dan tautan di footer.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 8,
    label: "KAMA Retail",
    href: "/admin/retail",
    group: "katalog",
    hint: "Produk yang tampil di halaman KAMA Retail.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 4,
    label: "Promos & Gift Card",
    href: "/admin/promos",
    group: "konten",
    hint: "Halaman Promos, Gift Card, dan section Promo Highlight di homepage.",
    roles: CONTENT_ROLES,
    ready: true,
    children: [{ label: "Gift Card", href: "/admin/gift-card" }],
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
    no: 7,
    label: "Events",
    href: "/admin/events",
    group: "konten",
    hint: "Halaman Events dan Collaborations.",
    roles: CONTENT_ROLES,
    ready: true,
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
    // Modul tambahan di luar 14 modul Lampiran I; nomor 16 hanya penanda unik.
    no: 16,
    label: "Media Library",
    href: "/admin/media",
    group: "konten",
    hint: "Gudang gambar yang dipakai modul lain lewat tombol “Pilih dari media”.",
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
      { label: "Konten halaman", href: "/admin/corporate/content" },
      { label: "PIC", href: "/admin/corporate/pic" },
      { label: "Inquiries", href: "/admin/corporate/inquiries" },
    ],
  },
  {
    no: 10,
    label: "Homepage & Our Story",
    href: "/admin/homepage",
    group: "struktur",
    hint: "Susunan section homepage, hero, statistik, ulasan, feed Instagram, dan halaman Our Story.",
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
    no: 11,
    label: "Menu Navigasi",
    href: "/admin/menu",
    group: "struktur",
    hint: "Tautan di header, mega-menu, menu mobile, dan footer.",
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

/** Modul per kelompok sidebar untuk role tertentu; kelompok kosong dibuang. */
export function groupedModulesForRole(
  role: AdminRoleName,
): GroupedModules<AdminModule>[] {
  return groupModules(modulesForRole(role), ADMIN_GROUPS);
}

/** Href modul/sub-menu yang sedang dibuka — untuk menandai sidebar. */
export function activeHrefForPath(pathname: string): string | null {
  return activeAdminHref(ADMIN_MODULES, pathname);
}

/** Petunjuk konteks modul yang mencakup sebuah path admin, atau null. */
export function moduleHintForPath(pathname: string): string | null {
  const active = activeAdminHref(ADMIN_MODULES, pathname);
  if (!active) return null;
  const owner = ADMIN_MODULES.find(
    (m) =>
      m.href === active || (m.children ?? []).some((c) => c.href === active),
  );
  return owner?.hint ?? null;
}

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
