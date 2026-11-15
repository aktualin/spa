"use server";

import { revalidatePath } from "next/cache";

import { guestAttributeSchema } from "@/lib/domain/guests";
import { prisma } from "@/lib/prisma";

import { requireModuleRole } from "../access";
import { firstIssue } from "../promos/_kit/schema";
import {
  GUEST_MODULE_PATH,
  deleteAttributeRow,
  upsertAttributeRow,
} from "./guests.helpers";

/**
 * Aksi atribut mandiri (di luar form tamu): menambah/mengubah satu baris
 * key-value milik tamu, dan menghapus satu baris berdasarkan key. Form
 * tambah/edit tamu memakai strategi ganti-semua di ./guests.save.ts.
 */

function revalidateGuest(guestId: string) {
  revalidatePath(GUEST_MODULE_PATH);
  revalidatePath(`${GUEST_MODULE_PATH}/${guestId}`);
  revalidatePath(`${GUEST_MODULE_PATH}/${guestId}/edit`);
}

/** Tambah atau perbarui satu atribut; melempar Error bila input tidak valid. */
export async function upsertGuestAttribute(
  guestId: string,
  key: string,
  value: string | null,
): Promise<void> {
  await requireModuleRole(GUEST_MODULE_PATH);

  const parsed = guestAttributeSchema.safeParse({ key, value: value ?? "" });
  if (!parsed.success) throw new Error(firstIssue(parsed.error));

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { id: true },
  });
  if (!guest) throw new Error("Tamu tidak ditemukan.");

  await upsertAttributeRow(prisma, guestId, parsed.data.key, parsed.data.value);
  revalidateGuest(guestId);
}

/** Hapus satu atribut berdasarkan key; melempar Error bila tamu tidak ada. */
export async function deleteGuestAttribute(
  guestId: string,
  key: string,
): Promise<void> {
  await requireModuleRole(GUEST_MODULE_PATH);

  const parsed = guestAttributeSchema.shape.key.safeParse(key);
  if (!parsed.success) throw new Error(firstIssue(parsed.error));

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { id: true },
  });
  if (!guest) throw new Error("Tamu tidak ditemukan.");

  await deleteAttributeRow(prisma, guestId, parsed.data);
  revalidateGuest(guestId);
}
