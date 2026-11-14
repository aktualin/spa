"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { CHANGE_PASSWORD_PATH, safeAdminNext } from "@/lib/domain/admin-redirect";
import { extractClientIp } from "@/lib/domain/inquiry";
import { loginLimiter } from "@/lib/domain/rate-limit";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

import { firstIssue } from "../promos/_kit/schema";
import { getDummyHash, loginSchema, recordFailedLogin, type LoginState } from "./auth.helpers";

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // Lapis pertama: per IP, menahan tebak-tebakan lintas banyak akun. Lapis
  // kedua (penguncian per akun) ada di bawah.
  const limit = loginLimiter.check(extractClientIp(await headers()));
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterMs / 60_000);
    return {
      error: `Terlalu banyak percobaan masuk dari jaringan ini. Coba lagi dalam ${minutes} menit.`,
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    // Input tersembunyi `next` hanya ada bila login datang dari redirect;
    // formData.get() mengembalikan null, bukan undefined, saat field tidak ada.
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { email, password, next } = parsed.data;
  const user = await prisma.adminUser.findUnique({ where: { email } });

  // Pesan yang sama untuk user tidak ada / password salah, supaya tidak
  // membocorkan email mana yang terdaftar.
  const genericError = { error: "Email atau kata sandi salah." };

  if (!user || !user.isActive) {
    await verifyPassword(password, await getDummyHash());
    return genericError;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / 60_000,
    );
    return {
      error: `Akun terkunci sementara karena terlalu banyak percobaan gagal. Coba lagi dalam ${minutes} menit.`,
    };
  }

  const ok = await verifyPassword(password, user.passwordHash);

  if (!ok) {
    const locked = await recordFailedLogin(user);
    return locked ?? genericError;
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionVersion: user.sessionVersion,
    mustChangePassword: user.mustChangePassword,
  });

  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  redirect(user.mustChangePassword ? CHANGE_PASSWORD_PATH : safeAdminNext(next));
}