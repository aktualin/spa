"use server";

import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { validateReviewInput } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { checked, text } from "../promos/_kit/schema";
import {
  ORDER,
  REVIEWS_PATH,
  deleteHomepageRow,
  idOf,
  moveHomepageRow,
  revalidateAll,
  toggleHomepageRow,
  type ActionState,
} from "./homepage-content.helpers";

export async function listHomepageReviews() {
  await requireSession();
  return prisma.homepageReview.findMany({ orderBy: ORDER });
}

export async function getHomepageReview(id: string) {
  await requireSession();
  return prisma.homepageReview.findUnique({ where: { id } });
}

export async function saveHomepageReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  const result = validateReviewInput({
    quote: text(formData, "quote"),
    name: text(formData, "name"),
    location: text(formData, "location"),
    role: text(formData, "role"),
    isPublished: checked(formData, "isPublished"),
  });
  if (!result.ok) return { error: result.error };

  if (id) {
    const found = await prisma.homepageReview.findUnique({ where: { id }, select: { id: true } });
    if (!found) return { error: "Ulasan tidak ditemukan." };
    await prisma.homepageReview.update({ where: { id }, data: result.data });
  } else {
    const last = await prisma.homepageReview.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    await prisma.homepageReview.create({
      data: { ...result.data, sortOrder: last ? last.sortOrder + 1 : 0 },
    });
  }
  revalidateAll(REVIEWS_PATH);
  redirect(`${REVIEWS_PATH}?saved=1`);
}

export async function deleteHomepageReviewAction(formData: FormData) {
  await deleteHomepageRow(formData, REVIEWS_PATH, (id) =>
    prisma.homepageReview.deleteMany({ where: { id } }),
  );
}

export async function moveHomepageReviewAction(formData: FormData) {
  await moveHomepageRow(
    formData,
    REVIEWS_PATH,
    () => prisma.homepageReview.findMany({ orderBy: ORDER, select: { id: true } }),
    (next) =>
      prisma.$transaction(
        next.map((rowId, index) =>
          prisma.homepageReview.update({ where: { id: rowId }, data: { sortOrder: index } }),
        ),
      ),
  );
}

export async function toggleHomepageReviewAction(formData: FormData) {
  await toggleHomepageRow(formData, REVIEWS_PATH, (id, isPublished) =>
    prisma.homepageReview.updateMany({ where: { id }, data: { isPublished } }),
  );
}

