"use server";

import { prisma } from "@/lib/prisma";

import {
  INSTAGRAM_PATH,
  ORDER,
  moveHomepageRow,
  toggleHomepageRow,
} from "./homepage-content.helpers";

export async function moveInstagramPostAction(formData: FormData) {
  await moveHomepageRow(
    formData,
    INSTAGRAM_PATH,
    () => prisma.instagramPost.findMany({ orderBy: ORDER, select: { id: true } }),
    (next) =>
      prisma.$transaction(
        next.map((rowId, index) =>
          prisma.instagramPost.update({ where: { id: rowId }, data: { sortOrder: index } }),
        ),
      ),
  );
}

export async function toggleInstagramPostAction(formData: FormData) {
  await toggleHomepageRow(formData, INSTAGRAM_PATH, (id, isPublished) =>
    prisma.instagramPost.updateMany({ where: { id }, data: { isPublished } }),
  );
}
