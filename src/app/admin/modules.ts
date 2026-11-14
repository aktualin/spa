import {
  activeAdminHref,
  canAccessAdminPath,
  findAccessRule,
  groupModules,
  rolesForAdminPath,
  visibleModules,
  type GroupedModules,
} from "../../lib/domain/admin-access.ts";
import type { AdminRoleName } from "../../lib/domain/roles.ts";

import { CATALOG_MODULES } from "./modules.catalog.ts";
import { CONTENT_MODULES } from "./modules.content.ts";
import { SYSTEM_MODULES } from "./modules.system.ts";
import { ADMIN_GROUPS, type AdminModule } from "./modules.types.ts";

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
export type { AdminModule } from "./modules.types.ts";
export { ADMIN_GROUPS };

/**
 * Urutan array = urutan tampil di sidebar dan kartu dashboard. Disusun
 * mengikuti alur kerja admin: kenali katalog dulu, isi konten yang tampil di
 * situs, atur halaman & navigasi, lalu pengaturan sistem. Nomor `no` tetap
 * nomor modul kontrak, bukan urutan tampil.
 */
export const ADMIN_MODULES: readonly AdminModule[] = [
  ...CATALOG_MODULES,
  ...CONTENT_MODULES,
  ...SYSTEM_MODULES,
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