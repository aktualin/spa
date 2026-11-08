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

import { heroStats, journalPosts, testimonials } from "@/data/content";
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

/**
 * Urutan & judul bawaan section lama — sama dengan komposisi homepage
 * sekarang (`src/app/page.tsx`) dan dengan seed (`scripts/seed.mts`).
 */
const LEGACY_SECTIONS: { key: HomepageSectionKey; title: string }[] = [
  { key: "hero", title: "Hero" },
  { key: "membership-banner", title: "Membership Banner" },
  { key: "whats-new", title: "Promo / Event Highlight" },
  { key: "reviews", title: "Reviews" },
  { key: "brand-intro", title: "Brand Intro" },
  { key: "socials", title: "Gallery Teaser & Instagram" },
  { key: "booking-banner", title: "Booking Banner" },
];

/**
 * Footer homepage: tampil bila barisnya belum ada. Tidak ikut urutan section
 * (selalu dirender paling bawah, di luar `<main>`).
 */
const FOOTER_SECTION: HomepageSection = {
  key: "footer",
  title: "Footer",
  subtitle: null,
  bodyHtml: null,
  imageUrl: null,
  mobileImageUrl: null,
  imageAlt: null,
  ctaLabel: null,
  ctaHref: null,
  isEnabled: true,
  sortOrder: Number.MAX_SAFE_INTEGER,
};

/** Section baru — hanya aktif bila barisnya ada di DB dan `isEnabled`. */
const NEW_SECTION_KEYS: HomepageSectionKey[] = [
  "signature-treatments",
  "promo-highlight",
  "gallery-teaser",
];

function fallbackSections(): HomepageSection[] {
  const legacy = LEGACY_SECTIONS.map((section, index) => ({
    key: section.key,
    title: section.title,
    subtitle: null,
    bodyHtml: null,
    imageUrl: null,
    mobileImageUrl: null,
    imageAlt: null,
    ctaLabel: null,
    ctaHref: null,
    isEnabled: true,
    sortOrder: index,
  }));
  return [...legacy, { ...FOOTER_SECTION }];
}

/**
 * Map `key` → section. Hanya section yang aktif (atau section lama yang
 * belum ada di DB) yang perlu dirender.
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
      if (rows.length === 0) throw new Error("section homepage kosong");

      const byKey = new Map<string, HomepageSection>();
      for (const row of rows) {
        byKey.set(row.key, {
          key: row.key as HomepageSectionKey,
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
        });
      }

      // Section lama yang belum ada di DB tetap tampil dengan urutan bawaan.
      const merged: Record<string, HomepageSection> = {};
      const fallback = fallbackSections();
      for (const section of fallback) {
        const fromDb = byKey.get(section.key);
        merged[section.key] = fromDb ?? section;
      }

      // Section baru: hanya kalau ada baris di DB.
      for (const key of NEW_SECTION_KEYS) {
        const fromDb = byKey.get(key);
        if (fromDb) merged[key] = fromDb;
      }

      // Section lain yang mungkin dibuat admin.
      for (const [key, section] of byKey) {
        if (!(key in merged)) merged[key] = section;
      }

      return merged;
    },
    Object.fromEntries(
      fallbackSections().map((section) => [section.key, section]),
    ),
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("minutes");
  return data;
}

/** Kartu statis lama "What's New" — dipakai bila tabel highlight kosong. */
function staticWhatsNewCards(): HighlightCard[] {
  return journalPosts.map((post) => ({
    key: post.slug,
    href: post.href,
    image: post.image,
    imageAlt: "",
    tag: post.tag,
    title: post.title,
    ctaLabel: "Learn More",
  }));
}

/**
 * Kartu section "What's New". Tabel `HomepageHighlight` kosong (atau DB tidak
 * terbaca) → kartu statis lama. Ada baris → hanya highlight yang
 * dipublikasikan dan sedang dalam periodenya (bisa nol kartu).
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
    return selectHighlightCards(rows, new Date()) ?? staticWhatsNewCards();
  }, staticWhatsNewCards());

  return data;
}

/** Statistik statis lama Brand Intro — dipakai bila tabel statistik kosong. */
function staticStats(): StatItem[] {
  return heroStats.map((stat) => ({ key: stat.label, value: stat.value, label: stat.label }));
}

/**
 * Statistik "KAMA at a glance" (Brand Intro). Tabel `HomepageStat` kosong
 * atau DB tidak terbaca → statistik statis lama. Ada baris → hanya yang
 * terbit (bisa nol).
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
    return selectStats(rows) ?? staticStats();
  }, staticStats());
  return data;
}

/** Ulasan statis lama — dipakai bila tabel ulasan kosong. */
function staticReviews(): ReviewItem[] {
  return testimonials.map((t) => ({
    key: t.name,
    quote: t.quote,
    name: t.name,
    location: t.location,
    role: t.role,
  }));
}

/** Ulasan section Reviews; pola fallback sama dengan `getHomepageStats`. */
export async function getHomepageReviews(): Promise<ReviewItem[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.homepage);
  cacheLife("minutes");

  const { data } = await safeQueryWithMeta<ReviewItem[]>(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.homepageReview.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return selectReviews(rows) ?? staticReviews();
  }, staticReviews());
  return data;
}

/**
 * Foto feed Instagram pilihan admin. `null` → tabel kosong / DB tidak
 * terbaca: komponen mempertahankan grid foto bawaan. Array (mungkin kosong)
 * → tampilkan foto admin.
 */
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
