/** Bacaan statistik, ulasan, dan feed Instagram homepage — lihat `homepage.ts`. */
import { cacheLife, cacheTag } from "next/cache";

import {
  selectInstagramPosts,
  selectReviews,
  selectStats,
  type InstagramItem,
  type ReviewItem,
  type StatItem,
} from "@/lib/domain/homepage";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

/**
 * Statistik "KAMA at a glance" (Brand Intro). Hanya yang terbit; tabel kosong
 * atau DB tidak terbaca → daftar kosong.
 */
export async function getHomepageStats(): Promise<StatItem[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.homepage);
  cacheLife("minutes");

  const { data } = await safeQueryWithMeta<StatItem[]>(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.homepageStat.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return selectStats(rows) ?? [];
  }, []);
  return data;
}

/** Ulasan section Reviews; pola sama dengan `getHomepageStats`. */
export async function getHomepageReviews(): Promise<ReviewItem[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.homepage);
  cacheLife("minutes");

  const { data } = await safeQueryWithMeta<ReviewItem[]>(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.homepageReview.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return selectReviews(rows) ?? [];
  }, []);
  return data;
}

/** Foto feed Instagram pilihan admin; tabel kosong → daftar kosong. */
export async function getInstagramPosts(): Promise<InstagramItem[] | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.homepage);
  cacheLife("minutes");

  const { data } = await safeQueryWithMeta<InstagramItem[] | null>(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.instagramPost.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return selectInstagramPosts(rows);
  }, null);
  return data;
}