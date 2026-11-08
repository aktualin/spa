import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { CHANGE_PASSWORD_PATH } from "@/lib/domain/admin-redirect";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_AUTH_DISABLED,
  SESSION_COOKIE,
  verifySessionToken,
  type AdminRoleName,
  type SessionPayload,
} from "@/lib/session";

/** Login ulang setelah sesi dicabut; proxy menghapus cookie lama di URL ini. */
export const EXPIRED_LOGIN_PATH = "/admin/login?reason=expired";

/**
 * Sesi pengganti saat `ADMIN_AUTH_DISABLED`: pakai akun ADMIN aktif pertama di
 * database supaya kolom jejak (`uploadedById`, `triggeredById`, dsb.) tetap
 * menunjuk user yang valid. Tidak ada akun → id sentinel; modul yang menulis
 * relasi ke `AdminUser` akan gagal dengan pesan jelas, bukan diam-diam.
 */
const getBypassSession = cache(async (): Promise<SessionPayload> => {
  const user = await prisma.adminUser.findFirst({
    where: { role: "ADMIN", isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, role: true, sessionVersion: true },
  });
  if (user) {
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionVersion: user.sessionVersion,
      // Jangan pernah memaksa ganti sandi saat login dimatikan.
      mustChangePassword: false,
    };
  }
  return {
    userId: "auth-disabled",
    email: "auth-disabled@kamaspa.local",
    role: "ADMIN",
    sessionVersion: 0,
    mustChangePassword: false,
  };
});

/**
 * Sesi aktif yang sudah dicocokkan dengan database, atau null. Token yang
 * tanda tangannya sah tetap ditolak bila akun dinonaktifkan atau
 * `sessionVersion`-nya sudah dinaikkan (password/role diganti). Role diambil
 * dari database, bukan dari token. Di-cache per request supaya layout, halaman,
 * dan Server Action dalam satu render hanya memicu satu query.
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  if (ADMIN_AUTH_DISABLED) {
    // Tetap baca cookie: tanpa ini route admin tidak punya dependensi request
    // dan ikut di-prerender statis (dashboard beku + `new Date()` error).
    await cookies();
    return getBypassSession();
  }

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const claims = await verifySessionToken(token);
  if (!claims) return null;

  const user = await prisma.adminUser.findUnique({
    where: { id: claims.userId },
    select: {
      email: true,
      role: true,
      isActive: true,
      sessionVersion: true,
      mustChangePassword: true,
    },
  });
  if (!user || !user.isActive) return null;
  if (user.sessionVersion !== claims.sessionVersion) return null;

  return {
    userId: claims.userId,
    email: user.email,
    role: user.role,
    sessionVersion: user.sessionVersion,
    mustChangePassword: user.mustChangePassword,
  };
});

/** True bila browser masih membawa cookie sesi (sah atau tidak). */
export async function hasSessionCookie(): Promise<boolean> {
  return Boolean((await cookies()).get(SESSION_COOKIE)?.value);
}

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
