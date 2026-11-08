import { redirect } from "next/navigation";

import { getSession, requireRole } from "@/lib/auth";
import type { SessionPayload } from "@/lib/session";

/**
 * Guard halaman modul 14 (Pengguna Admin) — khusus role ADMIN.
 * Editor yang mencoba membuka halaman ini diarahkan kembali ke dashboard
 * dengan penanda `?forbidden=1` (banner di dashboard).
 *
 * Role dicek dengan `requireRole(["ADMIN"])` — sama seperti Server Action
 * modul ini — hanya error "akses ditolak" yang diterjemahkan jadi redirect.
 */
export async function requireAdminPage(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  try {
    return await requireRole(["ADMIN"]);
  } catch {
    redirect("/admin?forbidden=1");
  }
}
