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
} from "./guests.helpers";

/** Buat tamu baru beserta seluruh atribut tambahannya. */
export async function createGuest(
  _prevState: GuestActionState,
  formData: FormData,
): Promise<GuestActionState> {
  await requireModuleRole(GUEST_MODULE_PATH);

  const parsed = guestFormSchema.safeParse(readGuestForm(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { nama, umur, jenisKelamin, attributes } = parsed.data;

  try {
    await prisma.guest.create({
      data: { nama, umur, jenisKelamin, attributes: { create: attributes } },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "Key atribut tidak boleh duplikat." };
    }
    throw error;
  }

  revalidatePath(GUEST_MODULE_PATH);
  redirect(`${GUEST_MODULE_PATH}?saved=1`);
}
