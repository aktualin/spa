"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { nextSortOrder, staticCorporateSteps, validateStepInput } from "@/lib/domain/corporate";
import { richTextInput } from "@/lib/domain/rich-text";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { formStr } from "./form-utils";
import {
  ORDER,
  deleteCorporateItem,
  moveCorporateItem,
  revalidateCorporate,
  type ActionState,
} from "./corporate-items.helpers";

export async function saveStepAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = formStr(formData, "id");
  const result = validateStepInput({ title: formStr(formData, "title"), body: richTextInput(formData.get("body")) });
  if (!result.ok) return { error: result.error };

  if (id) {
    const updated = await prisma.corporateStep.updateMany({ where: { id }, data: result.data });
    if (updated.count === 0) return { error: "Langkah tidak ditemukan (mungkin sudah dihapus)." };
  } else {
    const last = await prisma.corporateStep.aggregate({ _max: { sortOrder: true } });
    await prisma.corporateStep.create({
      data: { ...result.data, sortOrder: nextSortOrder(last._max.sortOrder) },
    });
  }

  revalidateCorporate();
  redirect("/admin/corporate?saved=1#langkah");
}

export async function deleteStepAction(formData: FormData) {
  await deleteCorporateItem(formData, "langkah", (id) =>
    prisma.corporateStep.deleteMany({ where: { id } }),
  );
}

export async function moveStepAction(formData: FormData) {
  await moveCorporateItem(
    formData,
    "langkah",
    () => prisma.corporateStep.findMany({ orderBy: ORDER, select: { id: true, sortOrder: true } }),
    (updates) =>
      prisma.$transaction(
        updates.map((row) =>
          prisma.corporateStep.update({ where: { id: row.id }, data: { sortOrder: row.sortOrder } }),
        ),
      ),
  );
}

/** Salin 4 langkah bawaan ke database (hanya bila tabel masih kosong). */
export async function importDefaultStepsAction() {
  await requireRole(CONTENT_ROLES);

  const count = await prisma.corporateStep.count();
  if (count === 0) {
    await prisma.corporateStep.createMany({
      data: staticCorporateSteps().map((s, index) => ({
        title: s.title,
        body: s.body,
        sortOrder: index,
      })),
    });
  }

  revalidateCorporate();
  redirect("/admin/corporate?saved=1#langkah");
}