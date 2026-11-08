/**
 * Bacaan publik event (`EventItem` + `EventPhoto`).
 *
 * Pemisahan upcoming/past/collaborations memakai `groupEvents` dari
 * `@/lib/domain/events` — dijalankan DI DALAM fungsi cached supaya
 * hasilnya konsisten (dan tidak error saat prerender).
 *
 * DB kosong/down → daftar kosong; halaman menampilkan pesan ramah.
 */
import { cacheLife, cacheTag } from "next/cache";

import { groupEvents } from "@/lib/domain/events";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type PublicEventPhoto = {
  id: string;
  imageUrl: string;
  caption: string | null;
};

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  location: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isCollaboration: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  photos: PublicEventPhoto[];
};

export type EventGroups = {
  upcoming: PublicEvent[];
  past: PublicEvent[];
  collaborations: PublicEvent[];
};

const EMPTY: PublicEvent[] = [];

type EventRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  location: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isCollaboration: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  photos: { id: string; imageUrl: string; caption: string | null }[];
};

async function queryEventRows(): Promise<EventRow[]> {
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.eventItem.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { startDate: "asc" }],
    include: {
      photos: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    coverUrl: r.coverUrl,
    location: r.location,
    startDate: r.startDate,
    endDate: r.endDate,
    isCollaboration: r.isCollaboration,
    seoTitle: r.seoTitle,
    seoDescription: r.seoDescription,
    photos: r.photos.map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      caption: p.caption,
    })),
  }));
}

/**
 * Semua event published, dikelompokkan menjadi upcoming / past / collaborations.
 * `cacheLife("minutes")` → event yang baru dipublish atau sudah lewat cepat
 * terbaca tanpa perlu deploy ulang.
 */
export async function getEventGroups(): Promise<EventGroups> {
  "use cache";
  cacheTag(CONTENT_TAGS.events);

  const { data, usedFallback } = await safeQueryWithMeta<EventGroups>(
    async () => {
      const rows = await queryEventRows();
      const grouped = groupEvents(rows, new Date());
      return {
        upcoming: grouped.upcoming,
        past: grouped.past,
        collaborations: grouped.collaborations,
      };
    },
    { upcoming: EMPTY, past: EMPTY, collaborations: EMPTY },
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("minutes");
  return data;
}

/** Detail satu event (beserta foto-fotonya). */
export async function getEvent(slug: string): Promise<PublicEvent | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.events);

  const { data, usedFallback } = await safeQueryWithMeta<PublicEvent | null>(
    async () => {
      const rows = await queryEventRows();
      return rows.find((r) => r.slug === slug) ?? null;
    },
    null,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("minutes");
  return data;
}

/** Daftar ringkas event — dipakai sitemap. */
export async function getEventSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.events);

  const { data, usedFallback } = await safeQueryWithMeta<string[]>(
    async () => {
      const rows = await queryEventRows();
      return rows.map((r) => r.slug);
    },
    [],
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("minutes");
  return data;
}
