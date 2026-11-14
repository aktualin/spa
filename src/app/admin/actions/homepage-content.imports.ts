"use server";

import { redirect } from "next/navigation";

import { heroStats, testimonials } from "@/data/content";
import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { REVIEWS_PATH, STATS_PATH, revalidateAll } from "./homepage-content.helpers";

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