import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { normalizeAdminPath } from "@/lib/domain/admin-access";
import type { SessionPayload } from "@/lib/session";

import { canAccessPath, rolesForPath } from "./modules";

/**
 * Guard halaman admin berdasarkan matriks role di ./modules.ts.
 *
 * Panggil di awal setiap page.tsx admin dengan path modulnya, mis.
 * `await requirePageAccess("/admin/status")`. Role yang tidak berhak tidak
 * melihat error: ia dikembalikan ke dashboard dengan pesan
 * "Anda tidak punya akses ..." (lihat ./page.tsx, parameter `forbidden`).
 */
export async function requirePageAccess(
  pathname: string,
): Promise<SessionPayload> {
  const session = await requireSession();
  if (!canAccessPath(session.role, pathname)) {
    redirect(`/admin?forbidden=${encodeURIComponent(normalizeAdminPath(pathname))}`);
  }
  return session;
}

/**
 * Guard Server Action berdasarkan matriks role yang sama dengan halaman:
 * `await requireModuleRole("/admin/settings/contact")`. Melempar error
 * "Akses ditolak" (seperti `requireRole`) bila role tidak diizinkan.
 */
export async function requireModuleRole(
  pathname: string,
): Promise<SessionPayload> {
  return requireRole(rolesForPath(pathname));
}
