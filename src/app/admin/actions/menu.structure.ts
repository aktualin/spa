"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { inheritRootLocations, validateStructure } from "@/lib/domain/menu";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { revalidateMenu, structureSchema } from "./menu.schemas";
import type { ActionState } from "./menu.types";

export async function deleteMenuItemAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  // Sub-menu ikut terhapus (onDelete: Cascade); UI sudah meminta konfirmasi.
  await prisma.menuItem.deleteMany({ where: { id } });
  revalidateMenu();
  redirect("/admin/menu?deleted=1");
}

export async function saveMenuStructureAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("structure") ?? "[]"));
  } catch {
    return { error: "Data susunan menu tidak valid." };
  }
  const parsed = structureSchema.safeParse(raw);
  if (!parsed.success) return { error: "Data susunan menu tidak valid." };
  const structure = parsed.data;

  const existing = await prisma.menuItem.findMany({
    select: { id: true, parentId: true, locations: true },
  });
  const existingIds = new Set(existing.map((row) => row.id));
  const sentIds = new Set(structure.map((row) => row.id));
  if (
    existingIds.size !== sentIds.size ||
    [...existingIds].some((id) => !sentIds.has(id))
  ) {
    return {
      error: "Menu sudah diubah di tempat lain. Muat ulang halaman, lalu susun kembali.",
    };
  }

  const structureError = validateStructure(structure);
  if (structureError) return { error: structureError };

  const locationsById = new Map(existing.map((row) => [row.id, row.locations]));
  const next = inheritRootLocations(
    existing,
    structure.map((row) => ({ ...row, locations: locationsById.get(row.id) ?? [] })),
  );

  await prisma.$transaction(
    next.map((row) =>
      prisma.menuItem.update({
        where: { id: row.id },
        data: {
          parentId: row.parentId,
          sortOrder: row.sortOrder,
          // Anak tidak menyimpan lokasi; akar baru mewarisi lokasi akar lamanya.
          locations: row.parentId === null ? row.locations : [],
        },
      }),
    ),
  );

  revalidateMenu();
  redirect("/admin/menu?saved=1");
}