"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { heroStats, testimonials } from "@/data/content";
import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  INSTAGRAM_LIMITS,
  STAT_LIMITS,
  reorderIds,
  validateInstagramInput,
  validateReviewInput,
  validateStatInput,
} from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { checked, text } from "../promos/_kit/schema";

/**
 * Server Action statistik Brand Intro (`HomepageStat`), ulasan
 * (`HomepageReview`), dan foto feed Instagram (`InstagramPost`). Aturan isi
 * ada di `@/lib/domain/homepage`. Pola sama dengan `homepage-highlights.ts`.
 */

export type ActionState = { error: string | null; ok?: boolean };

const STATS_PATH = "/admin/homepage/stats";
const REVIEWS_PATH = "/admin/homepage/reviews";
const INSTAGRAM_PATH = "/admin/homepage/instagram";

function revalidateAll(path: string) {
  updateTag(CONTENT_TAGS.homepage);
  revalidatePath(path);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

const ORDER = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];

function idOf(formData: FormData): string {
  return text(formData, "id")?.trim() ?? "";
}

// ---------------------------------------------------------------------------
// Statistik
// ---------------------------------------------------------------------------

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
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  if (!id) return;
  await prisma.homepageStat.deleteMany({ where: { id } });
  revalidateAll(STATS_PATH);
  redirect(`${STATS_PATH}?deleted=1`);
}

export async function moveHomepageStatAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  const direction = text(formData, "direction") === "up" ? "up" : "down";
  if (!id) return;
  const rows = await prisma.homepageStat.findMany({ orderBy: ORDER, select: { id: true } });
  const next = reorderIds(rows.map((r) => r.id), id, direction);
  if (!next) return;
  await prisma.$transaction(
    next.map((rowId, index) =>
      prisma.homepageStat.update({ where: { id: rowId }, data: { sortOrder: index } }),
    ),
  );
  revalidateAll(STATS_PATH);
  redirect(`${STATS_PATH}?saved=1`);
}

export async function toggleHomepageStatAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  if (!id) return;
  await prisma.homepageStat.updateMany({
    where: { id },
    data: { isPublished: text(formData, "isPublished") === "1" },
  });
  revalidateAll(STATS_PATH);
  redirect(`${STATS_PATH}?saved=1`);
}

/** Salin statistik bawaan Brand Intro; hanya bila tabel masih kosong. */
export async function importDefaultStatsAction() {
  await requireRole(CONTENT_ROLES);
  if ((await prisma.homepageStat.count()) > 0) redirect(STATS_PATH);
  await prisma.homepageStat.createMany({
    data: heroStats.map((stat, index) => ({
      value: stat.value,
      label: stat.label,
      isPublished: true,
      sortOrder: index,
    })),
  });
  revalidateAll(STATS_PATH);
  redirect(`${STATS_PATH}?saved=1`);
}

// ---------------------------------------------------------------------------
// Ulasan
// ---------------------------------------------------------------------------

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
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  if (!id) return;
  await prisma.homepageReview.deleteMany({ where: { id } });
  revalidateAll(REVIEWS_PATH);
  redirect(`${REVIEWS_PATH}?deleted=1`);
}

export async function moveHomepageReviewAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  const direction = text(formData, "direction") === "up" ? "up" : "down";
  if (!id) return;
  const rows = await prisma.homepageReview.findMany({ orderBy: ORDER, select: { id: true } });
  const next = reorderIds(rows.map((r) => r.id), id, direction);
  if (!next) return;
  await prisma.$transaction(
    next.map((rowId, index) =>
      prisma.homepageReview.update({ where: { id: rowId }, data: { sortOrder: index } }),
    ),
  );
  revalidateAll(REVIEWS_PATH);
  redirect(`${REVIEWS_PATH}?saved=1`);
}

export async function toggleHomepageReviewAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  if (!id) return;
  await prisma.homepageReview.updateMany({
    where: { id },
    data: { isPublished: text(formData, "isPublished") === "1" },
  });
  revalidateAll(REVIEWS_PATH);
  redirect(`${REVIEWS_PATH}?saved=1`);
}

/** Salin ulasan bawaan; hanya bila tabel masih kosong. */
export async function importDefaultReviewsAction() {
  await requireRole(CONTENT_ROLES);
  if ((await prisma.homepageReview.count()) > 0) redirect(REVIEWS_PATH);
  await prisma.homepageReview.createMany({
    data: testimonials.map((t, index) => ({
      quote: t.quote,
      name: t.name,
      location: t.location,
      role: t.role,
      isPublished: true,
      sortOrder: index,
    })),
  });
  revalidateAll(REVIEWS_PATH);
  redirect(`${REVIEWS_PATH}?saved=1`);
}

// ---------------------------------------------------------------------------
// Feed Instagram
// ---------------------------------------------------------------------------

/**
 * Foto grid bawaan feed Instagram. Salinan dari `galleryImages` di
 * `src/components/home/socials.tsx` (file itu tidak mengekspornya).
 */
const DEFAULT_INSTAGRAM_IMAGES = [
  "/img/kama/01-incense.jpg",
  "/img/kama/02-bottle-shadows.jpg",
  "/img/kama/03-oil-bowl.jpg",
  "/img/kama/04-turmeric-scrub.jpg",
  "/img/kama/05-foot-bath.jpg",
  "/img/kama/06-bride.jpg",
  "/img/kama/07-flower-bowl.jpg",
  "/img/kama/08-water-drop.jpg",
  "/img/kama/09-leaf-drop.jpg",
  "/img/kama/corporate/02-massage.jpg",
  "/img/kama/corporate/05-lounge.jpg",
  "/img/kama/corporate/12-guest-lounge.jpg",
];

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

export async function moveInstagramPostAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  const direction = text(formData, "direction") === "up" ? "up" : "down";
  if (!id) return;
  const rows = await prisma.instagramPost.findMany({ orderBy: ORDER, select: { id: true } });
  const next = reorderIds(rows.map((r) => r.id), id, direction);
  if (!next) return;
  await prisma.$transaction(
    next.map((rowId, index) =>
      prisma.instagramPost.update({ where: { id: rowId }, data: { sortOrder: index } }),
    ),
  );
  revalidateAll(INSTAGRAM_PATH);
  redirect(`${INSTAGRAM_PATH}?saved=1`);
}

export async function toggleInstagramPostAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = idOf(formData);
  if (!id) return;
  await prisma.instagramPost.updateMany({
    where: { id },
    data: { isPublished: text(formData, "isPublished") === "1" },
  });
  revalidateAll(INSTAGRAM_PATH);
  redirect(`${INSTAGRAM_PATH}?saved=1`);
}

/** Salin 12 foto grid bawaan; hanya bila tabel masih kosong. */
export async function importDefaultInstagramAction() {
  await requireRole(CONTENT_ROLES);
  if ((await prisma.instagramPost.count()) > 0) redirect(INSTAGRAM_PATH);
  await prisma.instagramPost.createMany({
    data: DEFAULT_INSTAGRAM_IMAGES.map((imageUrl, index) => ({
      imageUrl,
      isPublished: true,
      sortOrder: index,
    })),
  });
  revalidateAll(INSTAGRAM_PATH);
  redirect(`${INSTAGRAM_PATH}?saved=1`);
}
