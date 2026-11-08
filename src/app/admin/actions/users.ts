"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import {
  generateTemporaryPassword,
  validatePasswordStrength,
} from "@/lib/domain/password-policy";
import { ADMIN_ONLY_ROLES } from "@/lib/domain/roles";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

/**
 * `temporaryPassword` hanya terisi bila sistem membuatkan kata sandi acak.
 * Nilainya dikirim sekali sebagai hasil aksi (tidak disimpan, tidak dicatat di
 * log, tidak masuk URL) supaya ADMIN bisa menyampaikannya ke pemilik akun.
 */
export type ActionState = {
  error: string | null;
  ok?: boolean;
  temporaryPassword?: string;
  email?: string;
};

const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 100;

const roleField = z.enum(["ADMIN", "EDITOR"], {
  message: "Role harus ADMIN atau EDITOR.",
});

const nameField = z
  .string({ message: "Nama wajib diisi." })
  .trim()
  .min(1, "Nama wajib diisi.")
  .max(MAX_NAME_LENGTH, `Nama maksimal ${MAX_NAME_LENGTH} karakter.`);

const idField = z.string({ message: "Akun tidak ditemukan." }).trim().min(1, "Akun tidak ditemukan.");

/** Kosong = sistem membuatkan kata sandi acak. */
const optionalPasswordField = z
  .string()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const createUserSchema = z.object({
  email: z
    .string({ message: "Email wajib diisi." })
    .trim()
    .toLowerCase()
    .min(1, "Email wajib diisi.")
    .max(MAX_EMAIL_LENGTH, `Email maksimal ${MAX_EMAIL_LENGTH} karakter.`)
    .email("Format email tidak valid."),
  name: nameField,
  role: roleField,
  password: optionalPasswordField,
});

const updateUserSchema = z.object({
  id: idField,
  name: nameField,
  role: roleField,
  isActive: z.boolean(),
});

const resetPasswordSchema = z.object({
  id: idField,
  password: optionalPasswordField,
});

const deleteUserSchema = z.object({
  id: idField,
  confirmEmail: z.string().trim().toLowerCase(),
});

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}

function formString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/** Transaksi serializable bentrok dengan perubahan lain yang bersamaan. */
function isWriteConflict(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  ) {
    return true;
  }
  return error instanceof Error && /could not serialize/i.test(error.message);
}

const CONFLICT_ERROR =
  "Data akun sedang diubah oleh admin lain pada saat yang sama. Muat ulang halaman lalu coba lagi.";

const LAST_ADMIN_ERROR =
  "Minimal harus ada satu akun ADMIN aktif. Aktifkan atau naikkan role akun lain terlebih dahulu.";

/** Kata sandi dari form, atau kata sandi acak bila dikosongkan. */
function resolvePassword(
  typed: string | undefined,
  email: string,
): { password: string; generated: boolean } | { error: string } {
  if (typed === undefined) {
    return { password: generateTemporaryPassword(), generated: true };
  }
  const error = validatePasswordStrength(typed, { email });
  return error ? { error } : { password: typed, generated: false };
}

/** Dipakai halaman list; read-only tapi tetap butuh sesi ADMIN. */
export async function listUsers() {
  await requireRole(ADMIN_ONLY_ROLES);

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
      mustChangePassword: true,
      createdAt: true,
    },
  });
}

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(ADMIN_ONLY_ROLES);

  const parsed = createUserSchema.safeParse({
    email: formString(formData, "email"),
    name: formString(formData, "name"),
    role: formString(formData, "role"),
    password: formString(formData, "password"),
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

export async function updateUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(ADMIN_ONLY_ROLES);

  const parsed = updateUserSchema.safeParse({
    id: formString(formData, "id"),
    name: formString(formData, "name"),
    role: formString(formData, "role"),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { id, name, role } = parsed.data;
  const isSelf = session.userId === id;

  let result: ActionState | null;
  try {
    // Serializable: dua ADMIN yang saling menurunkan/menonaktifkan pada saat
    // bersamaan tidak boleh sama-sama lolos cek "ADMIN aktif terakhir".
    result = await prisma.$transaction(
      async (tx): Promise<ActionState | null> => {
        const target = await tx.adminUser.findUnique({
          where: { id },
          select: { id: true, role: true, isActive: true },
        });
        if (!target) return { error: "Akun tidak ditemukan." };

        // Checkbox nonaktif tidak ikut terkirim, jadi status aktif akun
        // sendiri selalu dipertahankan apa adanya.
        const isActive = isSelf ? target.isActive : parsed.data.isActive;

        // Admin tidak boleh menurunkan role atau menonaktifkan dirinya sendiri.
        if (isSelf && role !== "ADMIN") {
          return { error: "Anda tidak boleh menurunkan role akun Anda sendiri." };
        }
        if (isSelf && !isActive) {
          return { error: "Anda tidak boleh menonaktifkan akun Anda sendiri." };
        }

        const losesAdmin =
          target.role === "ADMIN" &&
          target.isActive &&
          (role !== "ADMIN" || !isActive);

        // Selalu harus ada minimal satu akun ADMIN aktif.
        if (losesAdmin) {
          const remaining = await tx.adminUser.count({
            where: { role: "ADMIN", isActive: true, NOT: { id } },
          });
          if (remaining === 0) return { error: LAST_ADMIN_ERROR };
        }

        // Role atau status berubah → sesi lama akun itu tidak boleh dipakai lagi.
        const accessChanged =
          role !== target.role || isActive !== target.isActive;

        await tx.adminUser.update({
          where: { id },
          data: {
            name,
            role,
            isActive,
            ...(accessChanged ? { sessionVersion: { increment: 1 } } : {}),
          },
        });
        return null;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (isWriteConflict(error)) return { error: CONFLICT_ERROR };
    throw error;
  }
  if (result) return result;

  redirect("/admin/users?saved=1");
}

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(ADMIN_ONLY_ROLES);

  const parsed = resetPasswordSchema.safeParse({
    id: formString(formData, "id"),
    password: formString(formData, "password"),
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

/**
 * Menghapus akun secara permanen. Hanya untuk akun yang sudah dinonaktifkan
 * (dua langkah, supaya tidak terhapus tak sengaja) dan bukan akun sendiri.
 * Media/backup yang pernah diunggah akun ini tetap ada; kolom pengunggahnya
 * menjadi kosong (onDelete: SetNull di schema).
 */
export async function deleteUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(ADMIN_ONLY_ROLES);

  const parsed = deleteUserSchema.safeParse({
    id: formString(formData, "id"),
    confirmEmail: formString(formData, "confirmEmail") ?? "",
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { id, confirmEmail } = parsed.data;

  if (id === session.userId) {
    return { error: "Anda tidak boleh menghapus akun Anda sendiri." };
  }

  let result: ActionState | null;
  try {
    result = await prisma.$transaction(
      async (tx): Promise<ActionState | null> => {
        const target = await tx.adminUser.findUnique({
          where: { id },
          select: { id: true, email: true, role: true, isActive: true },
        });
        if (!target) return { error: "Akun tidak ditemukan." };

        if (target.isActive) {
          return {
            error: "Nonaktifkan akun ini terlebih dahulu sebelum menghapusnya.",
          };
        }
        if (confirmEmail !== target.email) {
          return {
            error: "Ketik ulang alamat email akun ini dengan tepat untuk mengonfirmasi penghapusan.",
          };
        }

        // Akun nonaktif tidak dihitung sebagai ADMIN aktif, tapi tetap dicek
        // supaya aturan "minimal satu ADMIN aktif" tidak pernah terlewati.
        const remaining = await tx.adminUser.count({
          where: { role: "ADMIN", isActive: true, NOT: { id } },
        });
        if (remaining === 0) return { error: LAST_ADMIN_ERROR };

        await tx.adminUser.delete({ where: { id } });
        return null;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (isWriteConflict(error)) return { error: CONFLICT_ERROR };
    throw error;
  }
  if (result) return result;

  redirect("/admin/users?deleted=1");
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
