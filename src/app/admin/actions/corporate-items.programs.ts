"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import {
  nextSortOrder,
  staticCorporatePrograms,
  validateProgramInput,
} from "@/lib/domain/corporate";
import { richTextInput } from "@/lib/domain/rich-text";
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

export async function saveProgramAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = formStr(formData, "id");
  const result = validateProgramInput({
    name: formStr(formData, "name"),
    description: richTextInput(formData.get("description")),
    features: formAll(formData, "features"),
    imageUrl: formStr(formData, "imageUrl"),
    isPublished: formData.get("isPublished") === "on",
  });
  if (!result.ok) return { error: result.error };

  if (id) {
    const updated = await prisma.corporateProgram.updateMany({ where: { id }, data: result.data });
    if (updated.count === 0) return { error: "Program tidak ditemukan (mungkin sudah dihapus)." };
  } else {
    const last = await prisma.corporateProgram.aggregate({ _max: { sortOrder: true } });
    await prisma.corporateProgram.create({
      data: { ...result.data, sortOrder: nextSortOrder(last._max.sortOrder) },
    });
  }

  revalidateCorporate();
  redirect("/admin/corporate?saved=1#program");
}

export async function deleteProgramAction(formData: FormData) {
  await deleteCorporateItem(formData, "program", (id) =>
    prisma.corporateProgram.deleteMany({ where: { id } }),
  );
}

export async function moveProgramAction(formData: FormData) {
  await moveCorporateItem(
    formData,
    "program",
    () => prisma.corporateProgram.findMany({ orderBy: ORDER, select: { id: true, sortOrder: true } }),
    (updates) =>
      prisma.$transaction(
        updates.map((row) =>
          prisma.corporateProgram.update({ where: { id: row.id }, data: { sortOrder: row.sortOrder } }),
        ),
      ),
  );
}

/** Salin 3 program bawaan ke database (hanya bila tabel masih kosong). */
export async function importDefaultProgramsAction() {
  await requireRole(CONTENT_ROLES);

  const count = await prisma.corporateProgram.count();
  if (count === 0) {
    await prisma.corporateProgram.createMany({
      data: staticCorporatePrograms().map((p, index) => ({
        name: p.name,
        description: p.description,
        features: p.features,
        isPublished: true,
        sortOrder: index,
      })),
    });
  }

  revalidateCorporate();
  redirect("/admin/corporate?saved=1#program");
}