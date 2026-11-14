import { randomBytes } from "node:crypto";

import { z } from "zod";

import { MAX_PASSWORD_LENGTH } from "@/lib/domain/password-policy";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

// Hash acak untuk dibandingkan saat email tidak terdaftar/nonaktif, supaya
// waktu respons sama dengan akun asli dan tidak bisa dipakai menebak email.
let dummyHash: Promise<string> | null = null;
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(32).toString("hex"));
  return dummyHash;
}

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid."),
  password: z
    .string()
    .min(1, "Kata sandi wajib diisi.")
    .max(MAX_PASSWORD_LENGTH, "Email atau kata sandi salah."),
  next: z.string().optional(),
});

export type LoginState = { error: string | null };

/**
 * Catat percobaan masuk gagal; kunci akun sementara bila melewati batas.
 * Mengembalikan pesan galat bila akun baru saja dikunci, null bila belum.
 */
export async function recordFailedLogin(user: {
  id: string;
  failedLoginCount: number;
}): Promise<{ error: string } | null> {
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
  return null;
}