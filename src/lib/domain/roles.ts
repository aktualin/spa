/**
 * Pemeriksaan role admin.
 *
 * Rule yang berlaku (Lampiran I Bagian D):
 * - ADMIN   → seluruh 14 modul, termasuk "Pengguna Admin".
 * - EDITOR  → 13 modul konten; tidak boleh mengelola akun admin lain.
 */

export type AdminRoleName = "ADMIN" | "EDITOR";

/** Role yang boleh mengelola modul "Pengguna Admin" (nomor 14). */
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
