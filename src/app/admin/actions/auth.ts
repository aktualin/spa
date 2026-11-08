"use server";

import { randomBytes } from "node:crypto";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  CHANGE_PASSWORD_PATH,
  safeAdminNext,
} from "@/lib/domain/admin-redirect";
import { extractClientIp } from "@/lib/domain/inquiry";
import { MAX_PASSWORD_LENGTH } from "@/lib/domain/password-policy";
import { loginLimiter } from "@/lib/domain/rate-limit";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/session";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

// Hash acak untuk dibandingkan saat email tidak terdaftar/nonaktif, supaya
// waktu respons sama dengan akun asli dan tidak bisa dipakai menebak email.
let dummyHash: Promise<string> | null = null;
function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(32).toString("hex"));
  return dummyHash;
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid."),
  password: z
    .string()
    .min(1, "Kata sandi wajib diisi.")
    .max(MAX_PASSWORD_LENGTH, "Email atau kata sandi salah."),
  next: z.string().optional(),
});

export type LoginState = { error: string | null };

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
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
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
    const failedLoginCount = user.failedLoginCount + 1;
    const shouldLock = failedLoginCount >= MAX_FAILED_ATTEMPTS;

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        failedLoginCount: shouldLock ? 0 : failedLoginCount,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCK_MINUTES * 60_000)
          : null,
      },
    });

    if (shouldLock) {
      return {
        error: `Terlalu banyak percobaan gagal. Akun dikunci ${LOCK_MINUTES} menit.`,
      };
    }
    return genericError;
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

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
