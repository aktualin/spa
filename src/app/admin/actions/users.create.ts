"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { ADMIN_ONLY_ROLES } from "@/lib/domain/roles";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

import { firstIssue, text } from "../promos/_kit/schema";
import { isUniqueViolation, resolvePassword, type ActionState } from "./users.helpers";
import { createUserSchema } from "./users.schemas";

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(ADMIN_ONLY_ROLES);

  const parsed = createUserSchema.safeParse({
    email: text(formData, "email"),
    name: text(formData, "name"),
    role: text(formData, "role"),
    password: text(formData, "password"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { email, name, role } = parsed.data;

  const resolved = resolvePassword(parsed.data.password, email);
  if ("error" in resolved) return { error: resolved.error };

  const existing = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return { error: `Email "${email}" sudah dipakai akun lain.` };
  }

  try {
    await prisma.adminUser.create({
      data: {
        email,
        name,
        role,
        isActive: true,
        passwordHash: await hashPassword(resolved.password),
        // Password awal diketahui pembuatnya; pemilik akun wajib menggantinya.
        mustChangePassword: true,
      },
    });
  } catch (error) {
    // Dua ADMIN mendaftarkan email yang sama hampir bersamaan.
    if (isUniqueViolation(error)) {
      return { error: `Email "${email}" sudah dipakai akun lain.` };
    }
    throw error;
  }

  if (resolved.generated) {
    return { error: null, ok: true, email, temporaryPassword: resolved.password };
  }
  redirect("/admin/users?saved=1");
}