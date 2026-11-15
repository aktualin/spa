"use server";

import { prisma } from "@/lib/prisma";

import { requireModuleRole } from "../access";
import { GUEST_MODULE_PATH } from "./guests.helpers";

/**
 * Query modul Pencatatan Tamu. Data pribadi (UU PDP) — hanya untuk ADMIN/
 * EDITOR yang login; tidak pernah di-cache publik.
 */

/** Daftar tamu terbaru untuk halaman list, beserta jumlah atributnya. */
export async function getGuests() {
  await requireModuleRole(GUEST_MODULE_PATH);

  return prisma.guest.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      nama: true,
      umur: true,
      jenisKelamin: true,
      createdAt: true,
      _count: { select: { attributes: true } },
    },
  });
}

/** Satu tamu lengkap dengan seluruh atribut key-value-nya (urut key). */
export async function getGuestById(id: string) {
  await requireModuleRole(GUEST_MODULE_PATH);

  return prisma.guest.findUnique({
    where: { id },
    include: { attributes: { orderBy: { key: "asc" } } },
  });
}
