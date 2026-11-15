"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { requireModuleRole } from "../access";
import { GUEST_MODULE_PATH, readId } from "./guests.helpers";

/**
 * Hapus tamu secara permanen; seluruh atributnya ikut terhapus (CASCADE).
 * Dipakai langsung sebagai `form action` (pola deleteReservationAction),
 * jadi bertanda tangan satu argumen — bukan pasangan `useActionState`.
 */
export async function deleteGuest(formData: FormData): Promise<void> {
  await requireModuleRole(GUEST_MODULE_PATH);

  const id = readId(formData);
  if (!id) return;

  await prisma.guest.deleteMany({ where: { id } });

  revalidatePath(GUEST_MODULE_PATH);
  redirect(`${GUEST_MODULE_PATH}?deleted=1`);
}
