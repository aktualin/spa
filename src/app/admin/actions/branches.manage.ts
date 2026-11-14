"use server";

import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth";
import { planBranchMove, sortBranches } from "@/lib/domain/branch";
import { prisma } from "@/lib/prisma";

import { requireModuleRole } from "../access";
import { MODULE_PATH, revalidateBranches } from "./branches.helpers";

/**
 * Naikkan/turunkan urutan cabang (tombol ↑/↓ di daftar admin). Seluruh
 * cabang ditulis ulang menjadi 0..n-1 dalam satu transaksi, sehingga nilai
 * sortOrder kembar dari data lama ikut dirapikan dan tombol selalu berpengaruh.
 */
export async function moveBranchAction(formData: FormData) {
  await requireModuleRole(MODULE_PATH);

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const rows = await prisma.branch.findMany({
    select: { id: true, name: true, sortOrder: true },
  });
  const updates = planBranchMove(rows, id, direction);

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((row) =>
        prisma.branch.update({ where: { id: row.id }, data: { sortOrder: row.sortOrder } }),
      ),
    );
  }

  revalidateBranches();
  redirect("/admin/branches?saved=1");
}

/** Tampilkan/sembunyikan cabang langsung dari daftar admin. */
export async function toggleBranchPublishedAction(formData: FormData) {
  await requireModuleRole(MODULE_PATH);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const branch = await prisma.branch.findUnique({
    where: { id },
    select: { isPublished: true },
  });
  if (!branch) return;

  await prisma.branch.update({
    where: { id },
    data: { isPublished: !branch.isPublished },
  });

  revalidateBranches();
  redirect("/admin/branches?saved=1");
}

/** Dipakai halaman list; read-only tapi tetap butuh sesi. */
export async function listBranches() {
  await requireSession();
  const rows = await prisma.branch.findMany();
  return sortBranches(rows);
}

export async function getBranch(id: string) {
  await requireSession();
  return prisma.branch.findUnique({ where: { id } });
}