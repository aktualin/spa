"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export type ActionState = { error: string | null; ok?: boolean };

const ADMIN_ONLY = ["ADMIN"] as const;

const MIN_PASSWORD_LENGTH = 12;

const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid."),
  name: z.string().trim().min(1, "Nama wajib diisi."),
  role: z.enum(["ADMIN", "EDITOR"]),
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`,
    ),
});

const updateUserSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1, "Nama wajib diisi."),
  role: z.enum(["ADMIN", "EDITOR"]),
  isActive: z.boolean(),
});

const resetPasswordSchema = z.object({
  id: z.string().trim().min(1),
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`,
    ),
});

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}

/** Jumlah akun ADMIN aktif — dipakai untuk menjaga minimal satu ADMIN aktif. */
async function countActiveAdmins(excludeId?: string): Promise<number> {
  return prisma.adminUser.count({
    where: {
      role: "ADMIN",
      isActive: true,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

/** Dipakai halaman list; read-only tapi tetap butuh sesi ADMIN. */
export async function listUsers() {
  await requireRole(ADMIN_ONLY);

  return prisma.adminUser.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      failedLoginCount: true,
      lockedUntil: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
}

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(ADMIN_ONLY);

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { email, name, role, password } = parsed.data;

  const existing = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return { error: `Email "${email}" sudah dipakai akun lain.` };
  }

  await prisma.adminUser.create({
    data: {
      email,
      name,
      role,
      isActive: true,
      passwordHash: await hashPassword(password),
    },
  });

  redirect("/admin/users?saved=1");
}

export async function updateUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(ADMIN_ONLY);

  const parsed = updateUserSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { id, name, role } = parsed.data;

  const target = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, role: true, isActive: true },
  });
  if (!target) return { error: "Akun tidak ditemukan." };

  const isSelf = session.userId === id;

  // Checkbox nonaktif tidak ikut terkirim, jadi status aktif akun sendiri
  // selalu dipertahankan apa adanya.
  const isActive = isSelf ? target.isActive : parsed.data.isActive;

  // Admin tidak boleh menurunkan role atau menonaktifkan dirinya sendiri.
  if (isSelf && role !== "ADMIN") {
    return {
      error: "Anda tidak boleh menurunkan role akun Anda sendiri.",
    };
  }
  if (isSelf && !isActive) {
    return {
      error: "Anda tidak boleh menonaktifkan akun Anda sendiri.",
    };
  }

  const losesAdmin =
    target.role === "ADMIN" && (role !== "ADMIN" || !isActive);

  // Selalu harus ada minimal satu akun ADMIN aktif.
  if (losesAdmin) {
    const remaining = await countActiveAdmins(id);
    if (remaining === 0) {
      return {
        error: "Minimal harus ada satu akun ADMIN aktif. Aktifkan atau naikkan role akun lain terlebih dahulu.",
      };
    }
  }

  await prisma.adminUser.update({
    where: { id },
    data: { name, role, isActive },
  });

  redirect("/admin/users?saved=1");
}

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(ADMIN_ONLY);

  const parsed = resetPasswordSchema.safeParse({
    id: formData.get("id"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { id, password } = parsed.data;

  const target = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!target) return { error: "Akun tidak ditemukan." };

  await prisma.adminUser.update({
    where: { id },
    data: {
      passwordHash: await hashPassword(password),
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  redirect("/admin/users?saved=1");
}

export async function unlockUserAction(formData: FormData) {
  await requireRole(ADMIN_ONLY);

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
