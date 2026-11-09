/**
 * Bacaan publik section homepage (`HomepageSection`).
 *
 * Admin dapat menonaktifkan dan mengurutkan tiap section dari dashboard.
 * Section yang tidak ada di DB tetap dirender dengan urutan bawaan, kecuali
 * section BARU (signature-treatments, promo-highlight, gallery-teaser) —
 * section baru hanya tampil bila barisnya ada di DB dengan `isEnabled = true`.
 *
 * Section `footer` hanya berupa saklar tampil/sembunyi footer DI HOMEPAGE
 * (halaman lain selalu menampilkan footer). Tanpa baris DB → tampil.
 *
 * Kartu highlight "What's New" (`HomepageHighlight`) dibaca lewat
 * `getWhatsNewCards`.
 */
import { cacheLife, cacheTag } from "next/cache";

import {
  selectHighlightCards,
  selectInstagramPosts,
  selectReviews,
  selectStats,
  type HighlightCard,
  type InstagramItem,
  type ReviewItem,
  type StatItem,
} from "@/lib/domain/homepage";
import type { HeroSlideMediaType } from "@/lib/domain/hero-slide";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type HomepageSectionKey =
  | "hero"
  | "membership-banner"
  | "whats-new"
  | "reviews"
  | "brand-intro"
  | "socials"
  | "booking-banner"
  | "signature-treatments"
  | "promo-highlight"
  | "gallery-teaser"
  | "footer";

export type HomepageSection = {
  key: HomepageSectionKey;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  bodyHtml: string | null;
  imageUrl: string | null;
  /** Banner/hero: gambar khusus layar kecil, teks alt, dan tombol ajakan. */
  mobileImageUrl: string | null;
  imageAlt: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  isEnabled: boolean;
  sortOrder: number;
};

/** Baris `HeroSlide` yang siap dipakai resolver slider hero. */
export type HeroSlideRow = {
  id: string;
  mediaType: HeroSlideMediaType;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  videoUrl: string | null;
  imageAlt: string | null;
  isPublished: boolean;
  sortOrder: number;
};

/**
 * Map `key` → section dari DB. Tidak ada section bawaan: homepage hanya
 * merender baris yang memang ada di database dan aktif. Baris `footer` hanya
 * berupa saklar tampil/sembunyi footer di homepage (halaman lain selalu
 * menampilkan footer).
 */
export async function getHomepageSections(): Promise<
  Record<string, HomepageSection>
> {
  "use cache";
  cacheTag(CONTENT_TAGS.homepage);

  const { data, usedFallback } = await safeQueryWithMeta<
    Record<string, HomepageSection>
  >(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.homepageSection.findMany({
        orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
      });
      return Object.fromEntries(
        rows.map((row) => [
          row.key,
          {
            key: row.key as HomepageSectionKey,
            eyebrow: row.eyebrow,
            title: row.title,
            subtitle: row.subtitle,
            bodyHtml: row.bodyHtml,
            imageUrl: row.imageUrl,
            mobileImageUrl: row.mobileImageUrl,
            imageAlt: row.imageAlt,
            ctaLabel: row.ctaLabel,
            ctaHref: row.ctaHref,
            isEnabled: row.isEnabled,
            sortOrder: row.sortOrder,
          },
        ]),
      );
    },
    {},
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

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
