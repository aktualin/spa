"use server";

import { prisma } from "@/lib/prisma";

import { moveHomepageRow, toggleHomepageRow } from "./homepage-content.helpers";
import { LIST_PATH } from "./hero-slides.helpers";

export async function moveHeroSlideAction(formData: FormData) {
  await moveHomepageRow(
    formData,
    LIST_PATH,
    () =>
      prisma.heroSlide.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true },
      }),
    (next) =>
      prisma.$transaction(
        next.map((rowId, index) =>
          prisma.heroSlide.update({ where: { id: rowId }, data: { sortOrder: index } }),
        ),
      ),
  );
}

export async function toggleHeroSlideAction(formData: FormData) {
  await toggleHomepageRow(formData, LIST_PATH, (id, isPublished) =>
    prisma.heroSlide.update({ where: { id }, data: { isPublished } }),
  );
}