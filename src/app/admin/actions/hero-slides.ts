"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { reorderIds } from "@/lib/domain/homepage";
import { validateHeroSlideInput } from "@/lib/domain/hero-slide";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { checked, text } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const LIST_PATH = "/admin/homepage/hero";

function revalidateHeroSlides() {
  updateTag(CONTENT_TAGS.homepage);
  revalidatePath(LIST_PATH);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

function uniqueUrls(...values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

export async function listHeroSlides() {
  await requireSession();

  return prisma.heroSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getHeroSlide(id: string) {
  await requireSession();
  return prisma.heroSlide.findUnique({ where: { id } });
}

export async function saveHeroSlideAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";
  const result = validateHeroSlideInput({
    mediaType: text(formData, "mediaType"),
    imageUrl: text(formData, "imageUrl"),
    mobileImageUrl: text(formData, "mobileImageUrl"),
    videoUrl: text(formData, "videoUrl"),
    imageAlt: text(formData, "imageAlt"),
    isPublished: checked(formData, "isPublished"),
  });
  if (!result.ok) return { error: result.error };
  const data = result.data;

  if (id) {
    const previous = await prisma.heroSlide.findUnique({
      where: { id },
      select: { imageUrl: true, mobileImageUrl: true },
    });
    if (!previous) return { error: "Slide tidak ditemukan." };

    await prisma.heroSlide.update({ where: { id }, data });

    const keep = new Set(uniqueUrls(data.imageUrl, data.mobileImageUrl));
    for (const url of uniqueUrls(previous.imageUrl, previous.mobileImageUrl)) {
      if (!keep.has(url)) await deleteImageByUrl(url).catch(() => {});
    }
  } else {
    const last = await prisma.heroSlide.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    await prisma.heroSlide.create({
      data: { ...data, sortOrder: last ? last.sortOrder + 1 : 0 },
    });
  }

  revalidateHeroSlides();
  redirect(`${LIST_PATH}?saved=1`);
}

export async function deleteHeroSlideAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";
  if (!id) return;

  const existing = await prisma.heroSlide.findUnique({
    where: { id },
    select: { imageUrl: true, mobileImageUrl: true },
  });
  if (!existing) redirect(LIST_PATH);

  await prisma.heroSlide.delete({ where: { id } });
  for (const url of uniqueUrls(existing.imageUrl, existing.mobileImageUrl)) {
    await deleteImageByUrl(url).catch(() => {});
  }

  revalidateHeroSlides();
  redirect(`${LIST_PATH}?deleted=1`);
}

export async function moveHeroSlideAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";
  const direction = text(formData, "direction") === "up" ? "up" : "down";
  if (!id) return;

  const rows = await prisma.heroSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const next = reorderIds(
    rows.map((row) => row.id),
    id,
    direction,
  );
  if (!next) return;

  await prisma.$transaction(
    next.map((rowId, index) =>
      prisma.heroSlide.update({
        where: { id: rowId },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidateHeroSlides();
  redirect(`${LIST_PATH}?saved=1`);
}

export async function toggleHeroSlideAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";
  const raw = text(formData, "isPublished");
  if (!id) return;

  await prisma.heroSlide.update({
    where: { id },
    data: { isPublished: raw === "1" },
  });

  revalidateHeroSlides();
  redirect(`${LIST_PATH}?saved=1`);
}
