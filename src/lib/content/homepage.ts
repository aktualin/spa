/**
 * Bacaan publik section homepage (`HomepageSection`).
 *
 * Admin dapat menonaktifkan dan mengurutkan tiap section dari dashboard.
 * Section yang tidak ada di DB tetap dirender dengan urutan bawaan, kecuali
 * section BARU (signature-treatments, promo-highlight, gallery-teaser) —
 * section baru hanya tampil bila barisnya ada di DB dengan `isEnabled = true`.
 */
import { cacheLife, cacheTag } from "next/cache";

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
  | "gallery-teaser";

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

/** Section baru — hanya aktif bila barisnya ada di DB dan `isEnabled`. */
const NEW_SECTION_KEYS: HomepageSectionKey[] = [
  "signature-treatments",
  "promo-highlight",
  "gallery-teaser",
];

function fallbackSections(): HomepageSection[] {
  return LEGACY_SECTIONS.map((section, index) => ({
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
