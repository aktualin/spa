import { redirect } from "next/navigation";

import { getSession, requireRole } from "@/lib/auth";
import type { SessionPayload } from "@/lib/session";

/**
 * Guard halaman modul 19 (Backup & Status) — khusus role ADMIN. EDITOR
 * diarahkan ke dashboard dengan `?forbidden=1`, sama seperti modul Pengguna Admin.
 */
export async function requireAdminStatusPage(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  try {
    return await requireRole(["ADMIN"]);
  } catch {
    redirect("/admin?forbidden=1");
  }
}
