"use server";

import { redirect } from "next/navigation";

import { heroStats } from "@/data/content";
import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { STATS_PATH, revalidateAll } from "./homepage-content.helpers";

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