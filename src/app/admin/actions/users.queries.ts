"use server";

import { requireRole } from "@/lib/auth";
import { ADMIN_ONLY_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

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