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
import { updateUserSchema } from "./users.schemas";

export async function updateUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(ADMIN_ONLY_ROLES);

  const parsed = updateUserSchema.safeParse({
    id: text(formData, "id"),
    name: text(formData, "name"),
    role: text(formData, "role"),
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