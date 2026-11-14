"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { planRetailMove } from "@/lib/domain/retail";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { revalidateRetail } from "./retail.helpers";

/**
 * Naikkan/turunkan urutan produk (tombol ↑/↓ di daftar admin). Seluruh
 * produk ditulis ulang menjadi 0..n-1 dalam satu transaksi, sehingga nilai
 * sortOrder kembar dari data lama ikut dirapikan dan tombol selalu berpengaruh.
 */
export async function moveRetailAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const rows = await prisma.retailProduct.findMany({
    select: { id: true, name: true, isHighlight: true, sortOrder: true },
  });
  const updates = planRetailMove(rows, id, direction);

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((row) =>
        prisma.retailProduct.update({
          where: { id: row.id },
          data: { sortOrder: row.sortOrder },
        }),
      ),
    );
  }

  revalidateRetail();
  redirect("/admin/retail?saved=1");
}