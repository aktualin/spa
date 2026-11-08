import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  SESSION_COOKIE,
  verifySessionToken,
  type AdminRoleName,
  type SessionPayload,
} from "@/lib/session";

/** Mengembalikan sesi aktif, atau null kalau cookie tidak ada/invalid. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Dipanggil di awal setiap Server Action admin. Middleware sudah menjaga
 * navigasi halaman, tapi Server Action bisa dipanggil langsung dari client —
 * jadi pengecekan di sini wajib, bukan sekadar pelengkap.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
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
