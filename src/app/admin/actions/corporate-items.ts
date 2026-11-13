"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  nextSortOrder,
  readDirection,
  reorderUpdates,
  staticCorporatePrograms,
  staticCorporateSteps,
  validateClientInput,
  validateProgramInput,
  validateStepInput,
} from "@/lib/domain/corporate";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { richTextInput } from "@/lib/domain/rich-text";

/**
 * Daftar berurutan modul Corporate Wellness: program In-Office, langkah
 * kolaborasi, dan klien (logo + foto dokumentasi). Semua tulis wajib
 * ADMIN/EDITOR dan membuang cache konten `/corporate`.
 */

export type ActionState = { error: string | null; ok?: boolean };

/** Urutan tampil — sama persis dengan bacaan publik (`src/lib/content/corporate.ts`). */
const ORDER = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }, { id: "asc" as const }];

function revalidateCorporate() {
  updateTag(CONTENT_TAGS.corporate);
  revalidatePath("/corporate");
  revalidatePath("/admin/corporate");
}

function str(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function all(formData: FormData, name: string): string[] {
  return formData.getAll(name).map((value) => String(value));
}

/* ---------- Bacaan admin ---------- */

export async function listCorporateItems() {
  await requireSession();

  const [programs, steps, clients] = await Promise.all([
    prisma.corporateProgram.findMany({ orderBy: ORDER }),
    prisma.corporateStep.findMany({ orderBy: ORDER }),
    prisma.corporateClient.findMany({ orderBy: ORDER }),
  ]);
  return { programs, steps, clients };
}

export async function getCorporateProgram(id: string) {
  await requireSession();
  return prisma.corporateProgram.findUnique({ where: { id } });
}

export async function getCorporateStep(id: string) {
  await requireSession();
  return prisma.corporateStep.findUnique({ where: { id } });
}

export async function getCorporateClient(id: string) {
  await requireSession();
  return prisma.corporateClient.findUnique({ where: { id } });
}

/* ---------- Program In-Office ---------- */

export async function saveProgramAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = str(formData, "id");
  const result = validateProgramInput({
    name: str(formData, "name"),
    description: richTextInput(formData.get("description")),
    features: all(formData, "features"),
    imageUrl: str(formData, "imageUrl"),
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
  await requireRole(CONTENT_ROLES);

  const id = str(formData, "id");
  if (!id) return;
  await prisma.corporateProgram.deleteMany({ where: { id } });

  revalidateCorporate();
  redirect("/admin/corporate?deleted=1#program");
}

export async function moveProgramAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = str(formData, "id");
  const direction = readDirection(formData.get("direction"));
  if (!id || !direction) return;

  const rows = await prisma.corporateProgram.findMany({
    orderBy: ORDER,
    select: { id: true, sortOrder: true },
  });
  const updates = reorderUpdates(rows, id, direction);
  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((row) =>
        prisma.corporateProgram.update({ where: { id: row.id }, data: { sortOrder: row.sortOrder } }),
      ),
    );
  }

  revalidateCorporate();
  redirect("/admin/corporate?saved=1#program");
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

/* ---------- Langkah kolaborasi ---------- */

export async function saveStepAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = str(formData, "id");
  const result = validateStepInput({ title: str(formData, "title"), body: richTextInput(formData.get("body")) });
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
  await requireRole(CONTENT_ROLES);

  const id = str(formData, "id");
  if (!id) return;
  await prisma.corporateStep.deleteMany({ where: { id } });

  revalidateCorporate();
  redirect("/admin/corporate?deleted=1#langkah");
}

export async function moveStepAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = str(formData, "id");
  const direction = readDirection(formData.get("direction"));
  if (!id || !direction) return;

  const rows = await prisma.corporateStep.findMany({
    orderBy: ORDER,
    select: { id: true, sortOrder: true },
  });
  const updates = reorderUpdates(rows, id, direction);
  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((row) =>
        prisma.corporateStep.update({ where: { id: row.id }, data: { sortOrder: row.sortOrder } }),
      ),
    );
  }

  revalidateCorporate();
  redirect("/admin/corporate?saved=1#langkah");
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

/* ---------- Klien (logo + foto dokumentasi) ---------- */

export async function saveClientAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = str(formData, "id");
  const result = validateClientInput({
    name: str(formData, "name"),
    logoUrl: str(formData, "logoUrl"),
    websiteUrl: str(formData, "websiteUrl"),
    photoUrls: all(formData, "photoUrls"),
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
  await requireRole(CONTENT_ROLES);

  const id = str(formData, "id");
  if (!id) return;
  await prisma.corporateClient.deleteMany({ where: { id } });

  revalidateCorporate();
  redirect("/admin/corporate?deleted=1#klien");
}

export async function moveClientAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = str(formData, "id");
  const direction = readDirection(formData.get("direction"));
  if (!id || !direction) return;

  const rows = await prisma.corporateClient.findMany({
    orderBy: ORDER,
    select: { id: true, sortOrder: true },
  });
  const updates = reorderUpdates(rows, id, direction);
  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((row) =>
        prisma.corporateClient.update({ where: { id: row.id }, data: { sortOrder: row.sortOrder } }),
      ),
    );
  }

  revalidateCorporate();
  redirect("/admin/corporate?saved=1#klien");
}
