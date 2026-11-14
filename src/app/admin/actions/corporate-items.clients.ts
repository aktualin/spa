"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { nextSortOrder, validateClientInput } from "@/lib/domain/corporate";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { formAll, formStr } from "./form-utils";
import {
  ORDER,
  deleteCorporateItem,
  moveCorporateItem,
  revalidateCorporate,
  type ActionState,
} from "./corporate-items.helpers";

export async function saveClientAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = formStr(formData, "id");
  const result = validateClientInput({
    name: formStr(formData, "name"),
    logoUrl: formStr(formData, "logoUrl"),
    websiteUrl: formStr(formData, "websiteUrl"),
    photoUrls: formAll(formData, "photoUrls"),
    isPublished: formData.get("isPublished") === "on",
  });
  if (!result.ok) return { error: result.error };

  if (id) {
    const updated = await prisma.corporateClient.updateMany({ where: { id }, data: result.data });
    if (updated.count === 0) return { error: "Klien tidak ditemukan (mungkin sudah dihapus)." };
  } else {
    const last = await prisma.corporateClient.aggregate({ _max: { sortOrder: true } });
    await prisma.corporateClient.create({
      data: { ...result.data, sortOrder: nextSortOrder(last._max.sortOrder) },
    });
  }

  revalidateCorporate();
  redirect("/admin/corporate?saved=1#klien");
}

export async function deleteClientAction(formData: FormData) {
  await deleteCorporateItem(formData, "klien", (id) =>
    prisma.corporateClient.deleteMany({ where: { id } }),
  );
}

export async function moveClientAction(formData: FormData) {
  await moveCorporateItem(
    formData,
    "klien",
    () => prisma.corporateClient.findMany({ orderBy: ORDER, select: { id: true, sortOrder: true } }),
    (updates) =>
      prisma.$transaction(
        updates.map((row) =>
          prisma.corporateClient.update({ where: { id: row.id }, data: { sortOrder: row.sortOrder } }),
        ),
      ),
  );
}