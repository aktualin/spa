"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import {
  INSTAGRAM_LIMITS,
  normalizeInstagramPostUrl,
  validateInstagramInput,
} from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { checked, text } from "../promos/_kit/schema";
import {
  INSTAGRAM_PATH,
  ORDER,
  idOf,
  revalidateAll,
  type ActionState,
} from "./homepage-content.helpers";

export async function listInstagramPosts() {
  await requireSession();
  return prisma.instagramPost.findMany({ orderBy: ORDER });
}

export async function getInstagramPost(id: string) {
  await requireSession();
  return prisma.instagramPost.findUnique({ where: { id } });
}

/** Postingan yang sama (URL kanonis) tidak boleh dobel di daftar. */
async function hasDuplicate(postUrl: string, id: string | null) {
  const rows = await prisma.instagramPost.findMany({
    select: { id: true, postUrl: true },
  });
  return rows.some(
    (row) => row.id !== id && normalizeInstagramPostUrl(row.postUrl) === postUrl,
  );
}

export async function saveInstagramPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  const result = validateInstagramInput({
    postUrl: text(formData, "postUrl"),
    isPublished: checked(formData, "isPublished"),
  });
  if (!result.ok) return { error: result.error };
  const data = result.data;

  if (await hasDuplicate(data.postUrl, id)) {
    return { error: "Postingan itu sudah ada di daftar." };
  }

  if (id) {
    const existing = await prisma.instagramPost.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return { error: "Postingan tidak ditemukan." };
    await prisma.instagramPost.update({ where: { id }, data });
  } else {
    const count = await prisma.instagramPost.count();
    if (count >= INSTAGRAM_LIMITS.max) {
      return { error: `Maksimal ${INSTAGRAM_LIMITS.max} postingan.` };
    }
    const last = await prisma.instagramPost.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    await prisma.instagramPost.create({
      data: { ...data, sortOrder: last ? last.sortOrder + 1 : 0 },
    });
  }
  revalidateAll(INSTAGRAM_PATH);
  redirect(`${INSTAGRAM_PATH}?saved=1`);
}

export async function deleteInstagramPostAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  if (!id) return;
  const existing = await prisma.instagramPost.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) redirect(INSTAGRAM_PATH);
  await prisma.instagramPost.delete({ where: { id } });
  revalidateAll(INSTAGRAM_PATH);
  redirect(`${INSTAGRAM_PATH}?deleted=1`);
}
