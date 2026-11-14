/**
 * Penjagaan sesi & role admin. Pembacaan sesi ada di `auth.session.ts`;
 * berkas ini mengekspor ulangnya plus guard Server Action/halaman.
 */
import { redirect } from "next/navigation";

import { CHANGE_PASSWORD_PATH } from "@/lib/domain/admin-redirect";
import { type AdminRoleName, type SessionPayload } from "@/lib/session";

import { EXPIRED_LOGIN_PATH, getSession, hasSessionCookie } from "./auth.session";

export { EXPIRED_LOGIN_PATH, getSession, hasSessionCookie } from "./auth.session";

/**
 * Dipanggil di awal setiap Server Action dan halaman admin. Proxy sudah menjaga
 * navigasi, tapi Server Action bisa dipanggil langsung dari client — jadi
 * pengecekan di sini wajib, bukan sekadar pelengkap.
 */
export async function requireSession(
  options: { allowMustChangePassword?: boolean } = {},
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect((await hasSessionCookie()) ? EXPIRED_LOGIN_PATH : "/admin/login");
  }
  if (session.mustChangePassword && !options.allowMustChangePassword) {
    redirect(CHANGE_PASSWORD_PATH);
  }
  return session;
}

/** Membatasi aksi ke role tertentu (mis. modul Pengguna Admin → ADMIN saja). */
export async function requireRole(
  allowed: readonly AdminRoleName[],
): Promise<SessionPayload> {
  const session = await requireSession();
  if (!allowed.includes(session.role)) {
    throw new Error("Akses ditolak: role Anda tidak diizinkan untuk aksi ini.");
  }
  return session;
}