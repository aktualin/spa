"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { INSTAGRAM_LIMITS, validateInstagramInput } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

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

export async function saveInstagramPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  const result = validateInstagramInput({
    imageUrl: text(formData, "imageUrl"),
    imageAlt: text(formData, "imageAlt"),
    href: text(formData, "href"),
    isPublished: checked(formData, "isPublished"),
  });
  if (!result.ok) return { error: result.error };
  const data = result.data;

  if (id) {
    const previous = await prisma.instagramPost.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!previous) return { error: "Foto tidak ditemukan." };
    await prisma.instagramPost.update({ where: { id }, data });
    if (previous.imageUrl !== data.imageUrl) {
      await deleteImageByUrl(previous.imageUrl).catch(() => {});
    }
  } else {
    const count = await prisma.instagramPost.count();
    if (count >= INSTAGRAM_LIMITS.max) {
      return { error: `Maksimal ${INSTAGRAM_LIMITS.max} foto.` };
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
    select: { imageUrl: true },
  });
  if (!existing) redirect(INSTAGRAM_PATH);
  await prisma.instagramPost.delete({ where: { id } });
  await deleteImageByUrl(existing.imageUrl).catch(() => {});
  revalidateAll(INSTAGRAM_PATH);
  redirect(`${INSTAGRAM_PATH}?deleted=1`);
}