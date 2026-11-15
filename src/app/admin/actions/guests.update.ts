"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type GuestActionState, guestFormSchema } from "@/lib/domain/guests";
import { prisma } from "@/lib/prisma";

import { requireModuleRole } from "../access";
import { firstIssue } from "../promos/_kit/schema";
import {
  GUEST_MODULE_PATH,
  isUniqueViolation,
  readGuestForm,
  readId,
} from "./guests.helpers";

/** Perbarui data utama tamu + ganti seluruh atribut dengan baris dari form. */
export async function updateGuest(
  _prevState: GuestActionState,
  formData: FormData,
): Promise<GuestActionState> {
  await requireModuleRole(GUEST_MODULE_PATH);

  const id = readId(formData);
  if (!id) return { error: "Tamu tidak valid." };

  const parsed = guestFormSchema.safeParse(readGuestForm(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { nama, umur, jenisKelamin, attributes } = parsed.data;

  try {
    const result = await prisma.$transaction(
      async (tx): Promise<GuestActionState | null> => {
        const existing = await tx.guest.findUnique({
          where: { id },
          select: { id: true },
        });
        if (!existing) return { error: "Tamu tidak ditemukan." };

        await tx.guest.update({
          where: { id },
          data: { nama, umur, jenisKelamin },
        });
        await tx.guestAttribute.deleteMany({ where: { guestId: id } });
        if (attributes.length > 0) {
          await tx.guestAttribute.createMany({
            data: attributes.map((attr) => ({ guestId: id, ...attr })),
          });
        }
        return null;
      },
    );
    if (result) return result;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "Key atribut tidak boleh duplikat." };
    }
    throw error;
  }

  revalidatePath(GUEST_MODULE_PATH);
  revalidatePath(`${GUEST_MODULE_PATH}/${id}`);
  redirect(`${GUEST_MODULE_PATH}?saved=1`);
}
