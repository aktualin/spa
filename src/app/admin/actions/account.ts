"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth";
import { validateNewPassword } from "@/lib/domain/password-policy";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/session";

export type ChangePasswordState = { error: string | null };

export async function changeOwnPasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await requireSession({ allowMustChangePassword: true });

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) return { error: "Kata sandi saat ini wajib diisi." };

  const policyError = validateNewPassword({
    newPassword,
    confirmPassword,
    currentPassword,
  });
  if (policyError) return { error: policyError };

  const user = await prisma.adminUser.findUnique({
    where: { id: session.userId },
    select: { passwordHash: true },
  });
  if (!user) return { error: "Akun tidak ditemukan." };

  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    return { error: "Kata sandi saat ini salah." };
  }

  // Menaikkan sessionVersion mengeluarkan sesi di perangkat lain; sesi yang
  // sedang dipakai diganti token baru di bawah.
  const updated = await prisma.adminUser.update({
    where: { id: session.userId },
    data: {
      passwordHash: await hashPassword(newPassword),
      mustChangePassword: false,
      passwordChangedAt: new Date(),
      sessionVersion: { increment: 1 },
      failedLoginCount: 0,
      lockedUntil: null,
    },
    select: { email: true, role: true, sessionVersion: true },
  });

  const token = await createSessionToken({
    userId: session.userId,
    email: updated.email,
    role: updated.role,
    sessionVersion: updated.sessionVersion,
    mustChangePassword: false,
  });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  redirect("/admin?password=changed");
}
