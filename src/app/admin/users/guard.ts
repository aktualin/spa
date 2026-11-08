import type { SessionPayload } from "@/lib/session";

import { requirePageAccess } from "../access";

/**
 * Guard halaman modul 14 (Pengguna Admin) — khusus role ADMIN menurut matriks
 * di ../modules.ts. EDITOR yang membuka alamat modul ini dikembalikan ke
 * dashboard dengan pesan akses ditolak; Server Action modul ini memeriksa
 * role yang sama lewat `requireRole(ADMIN_ONLY_ROLES)`.
 */
export async function requireAdminPage(): Promise<SessionPayload> {
  return requirePageAccess("/admin/users");
}
