/** Pembacaan sesi admin — lihat `auth.ts`. */
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";

import { prisma } from "@/lib/prisma";
import {
  ADMIN_AUTH_DISABLED,
  SESSION_COOKIE,
  verifySessionToken,
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
  // Di bawah Cache Components `cookies()` saja tidak lagi membuat route jadi
  // dinamis: verifikasi JWT (jose memanggil `new Date()` internal) bisa ikut
  // jalan di pass prerender dan memicu error "unstable value" (mis. route
  // /admin/reservations). `connection()` menunda seluruh pembacaan sesi —
  // cookie, JWT, dan query admin — ke waktu request yang sebenarnya.
  await connection();

  if (ADMIN_AUTH_DISABLED) {
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
    // Dipertahankan agar ganti kata sandi tidak memendekkan sesi "Ingat saya".
    remember: claims.remember,
  };
});

/** True bila browser masih membawa cookie sesi (sah atau tidak). */
export async function hasSessionCookie(): Promise<boolean> {
  return Boolean((await cookies()).get(SESSION_COOKIE)?.value);
}