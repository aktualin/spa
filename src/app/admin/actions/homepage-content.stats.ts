"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { STAT_LIMITS, validateStatInput } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { checked, text } from "../promos/_kit/schema";
import {
  ORDER,
  STATS_PATH,
  deleteHomepageRow,
  idOf,
  moveHomepageRow,
  revalidateAll,
  toggleHomepageRow,
  type ActionState,
} from "./homepage-content.helpers";

export async function listHomepageStats() {
  await requireSession();
  return prisma.homepageStat.findMany({ orderBy: ORDER });
}

export async function getHomepageStat(id: string) {
  await requireSession();
  return prisma.homepageStat.findUnique({ where: { id } });
}

export async function saveHomepageStatAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  const result = validateStatInput({
    value: text(formData, "value"),
    label: text(formData, "label"),
    isPublished: checked(formData, "isPublished"),
  });
  if (!result.ok) return { error: result.error };

  if (id) {
    const found = await prisma.homepageStat.findUnique({ where: { id }, select: { id: true } });
    if (!found) return { error: "Statistik tidak ditemukan." };
    await prisma.homepageStat.update({ where: { id }, data: result.data });
  } else {
    const count = await prisma.homepageStat.count();
    if (count >= STAT_LIMITS.max) {
      return { error: `Maksimal ${STAT_LIMITS.max} statistik.` };
    }
    const last = await prisma.homepageStat.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    await prisma.homepageStat.create({
      data: { ...result.data, sortOrder: last ? last.sortOrder + 1 : 0 },
    });
  }
  revalidateAll(STATS_PATH);
  redirect(`${STATS_PATH}?saved=1`);
}

export async function deleteHomepageStatAction(formData: FormData) {
  await deleteHomepageRow(formData, STATS_PATH, (id) =>
    prisma.homepageStat.deleteMany({ where: { id } }),
  );
}

export async function moveHomepageStatAction(formData: FormData) {
  await moveHomepageRow(
    formData,
    STATS_PATH,
    () => prisma.homepageStat.findMany({ orderBy: ORDER, select: { id: true } }),
    (next) =>
      prisma.$transaction(
        next.map((rowId, index) =>
          prisma.homepageStat.update({ where: { id: rowId }, data: { sortOrder: index } }),
        ),
      ),
  );
}

export async function toggleHomepageStatAction(formData: FormData) {
  await toggleHomepageRow(formData, STATS_PATH, (id, isPublished) =>
    prisma.homepageStat.updateMany({ where: { id }, data: { isPublished } }),
  );
}

