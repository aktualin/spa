/** Bacaan media hero & kartu What's New — lihat `homepage.ts`. */
import { cacheLife, cacheTag } from "next/cache";

import { selectHighlightCards, type HighlightCard } from "@/lib/domain/homepage";
import { safeQueryWithMeta } from "@/lib/safe-query";

import type { HeroSlideRow } from "./homepage.types";
import { CONTENT_TAGS } from "./tags";

/**
 * Slide media hero. Tabel kosong atau DB tidak terbaca → daftar kosong;
 * `resolveHeroSlides` di domain akan memakai gambar fallback section.
 */
export async function getHeroSlides(): Promise<HeroSlideRow[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.homepage);
  cacheLife("minutes");

  const { data } = await safeQueryWithMeta<HeroSlideRow[]>(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.heroSlide.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      mediaType: row.mediaType,
      imageUrl: row.imageUrl,
      mobileImageUrl: row.mobileImageUrl,
      videoUrl: row.videoUrl,
      imageAlt: row.imageAlt,
      isPublished: row.isPublished,
      sortOrder: row.sortOrder,
    }));
  }, []);

  return data;
}

/**
 * Kartu section "What's New": hanya highlight yang dipublikasikan dan sedang
 * dalam periodenya. Tabel kosong atau DB tidak terbaca → daftar kosong.
 *
 * Periode dievaluasi DI DALAM fungsi cached dengan umur cache beberapa menit,
 * sehingga highlight terjadwal muncul/hilang sendiri tanpa perlu disimpan
 * ulang.
 */
export async function getWhatsNewCards(): Promise<HighlightCard[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.homepage);
  cacheLife("minutes");

  const { data } = await safeQueryWithMeta<HighlightCard[]>(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.homepageHighlight.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return selectHighlightCards(rows, new Date()) ?? [];
  }, []);

  return data;
}