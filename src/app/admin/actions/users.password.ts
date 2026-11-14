"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { ADMIN_ONLY_ROLES } from "@/lib/domain/roles";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

import { firstIssue, text } from "../promos/_kit/schema";
import { resolvePassword, type ActionState } from "./users.helpers";
import { resetPasswordSchema } from "./users.schemas";

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(ADMIN_ONLY_ROLES);

  const parsed = resetPasswordSchema.safeParse({
    id: text(formData, "id"),
    password: text(formData, "password"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { id } = parsed.data;

  if (id === session.userId) {
    return {
      error: "Untuk akun sendiri, gunakan menu Ganti kata sandi (perlu kata sandi lama).",
    };
  }

  const target = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, email: true },
  });
  if (!target) return { error: "Akun tidak ditemukan." };

  const resolved = resolvePassword(parsed.data.password, target.email);
  if ("error" in resolved) return { error: resolved.error };

  await prisma.adminUser.update({
    where: { id },
    data: {
      passwordHash: await hashPassword(resolved.password),
      failedLoginCount: 0,
      lockedUntil: null,
      mustChangePassword: true,
      // Keluarkan sesi yang mungkin dipakai orang yang mengetahui password lama.
      sessionVersion: { increment: 1 },
    },
  });

  if (resolved.generated) {
    return {
      error: null,
      ok: true,
      email: target.email,
      temporaryPassword: resolved.password,
    };
  }
  redirect("/admin/users?saved=1");
}

export async function unlockUserAction(formData: FormData) {
  await requireRole(ADMIN_ONLY_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const target = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!target) return;

  await prisma.adminUser.update({
    where: { id },
    data: { failedLoginCount: 0, lockedUntil: null },
  });

  redirect("/admin/users?unlocked=1");
}