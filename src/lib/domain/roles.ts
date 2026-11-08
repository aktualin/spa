/**
 * Pemeriksaan role admin.
 *
 * Dua role yang berlaku:
 * - ADMIN   → seluruh modul, termasuk modul pengaturan sistem (Pengguna Admin,
 *             Kontak & Umum, Backup & Status).
 * - EDITOR  → modul konten saja.
 *
 * Matriks role → modul lengkap (sumber tunggal) ada di
 * src/app/admin/modules.ts; pencocokan path-nya di ./admin-access.ts.
 */

export type AdminRoleName = "ADMIN" | "EDITOR";

/** Role untuk modul pengaturan sistem (Pengguna Admin, Kontak & Umum, Backup & Status). */
export const ADMIN_ONLY_ROLES: readonly AdminRoleName[] = ["ADMIN"];

/** Role yang boleh mengelola modul konten. */
export const CONTENT_ROLES: readonly AdminRoleName[] = ["ADMIN", "EDITOR"];

export function hasRole(
  role: AdminRoleName,
  allowed: readonly AdminRoleName[],
): boolean {
  return allowed.includes(role);
}

/** true bila role boleh membuka modul tertentu. */
export function canManageModule(
  role: AdminRoleName,
  allowed: readonly AdminRoleName[],
): boolean {
  return hasRole(role, allowed);
}
