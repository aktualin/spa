"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { ADMIN_ONLY_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { firstIssue, text } from "../promos/_kit/schema";
import {
  CONFLICT_ERROR,
  LAST_ADMIN_ERROR,
  isWriteConflict,
  type ActionState,
} from "./users.helpers";
import { deleteUserSchema } from "./users.schemas";

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
    id: text(formData, "id"),
    confirmEmail: text(formData, "confirmEmail") ?? "",
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