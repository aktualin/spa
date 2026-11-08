/**
 * Bacaan publik event (`EventItem` + `EventPhoto`).
 *
 * Status upcoming/past/collaborations memakai aturan di `@/lib/domain/events`
 * dan dievaluasi DI DALAM fungsi `"use cache"` dengan `cacheLife("minutes")`:
 * event yang baru lewat pindah kelompok paling lambat beberapa menit kemudian
 * tanpa deploy ulang, dan tulisan admin langsung terbaca lewat `updateTag`.
 *
 * Detail per slug membaca langsung dari database (cache di-key slug), bukan
 * menyaring daftar — event yang dibuat setelah build tetap ditemukan.
 *
 * DB kosong/down → daftar kosong; halaman menampilkan pesan ramah.
 */
import { cacheLife, cacheTag } from "next/cache";

import { eventPhase, groupEvents, type EventPhase } from "@/lib/domain/events";
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
  partnerName: string | null;
  partnerLogoUrl: string | null;
  partnerUrl: string | null;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  /** Status saat data dibaca (lihat aturan di `@/lib/domain/events`). */
  phase: EventPhase;
  photos: PublicEventPhoto[];
};

export type EventGroups = {
  upcoming: PublicEvent[];
  past: PublicEvent[];
  collaborations: PublicEvent[];
};

const EMPTY: PublicEvent[] = [];

const eventInclude = {
  photos: {
    orderBy: [{ sortOrder: "asc" as const }, { id: "asc" as const }],
    select: { id: true, imageUrl: true, caption: true },
  },
};

type EventRow = Omit<PublicEvent, "phase">;

function toRow(r: EventRow): EventRow {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    coverUrl: r.coverUrl,
    location: r.location,
    startDate: r.startDate,
    endDate: r.endDate,
    isCollaboration: r.isCollaboration,
    partnerName: r.partnerName,
    partnerLogoUrl: r.partnerLogoUrl,
    partnerUrl: r.partnerUrl,
    sortOrder: r.sortOrder,
    seoTitle: r.seoTitle,
    seoDescription: r.seoDescription,
    photos: r.photos.map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      caption: p.caption,
    })),
  };
}

const withPhase = (row: EventRow, now: Date): PublicEvent => ({
  ...row,
  phase: eventPhase(row, now),
});

/**
 * Semua event published, dikelompokkan menjadi upcoming / past / collaborations.
 */
export async function getEventGroups(): Promise<EventGroups> {
  "use cache";
  cacheTag(CONTENT_TAGS.events);
  cacheLife("minutes");

  const { data } = await safeQueryWithMeta<EventGroups>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.eventItem.findMany({
        where: { isPublished: true },
        include: eventInclude,
      });
      const now = new Date();
      return groupEvents(
        rows.map((row) => withPhase(toRow(row), now)),
        now,
      );
    },
    { upcoming: EMPTY, past: EMPTY, collaborations: EMPTY },
  );

  return data;
}

/** Detail satu event published (beserta foto-fotonya), dibaca per slug. */
export async function getEvent(slug: string): Promise<PublicEvent | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.events);
  cacheLife("minutes");

  const { data } = await safeQueryWithMeta<PublicEvent | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.eventItem.findFirst({
        where: { slug, isPublished: true },
        include: eventInclude,
      });
      return row ? withPhase(toRow(row), new Date()) : null;
    },
    null,
  );

  return data;
}

/** Slug semua event published — dipakai sitemap. */
export async function getEventSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.events);
  cacheLife("minutes");

  const { data } = await safeQueryWithMeta<string[]>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.eventItem.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
        select: { slug: true },
      });
      return rows.map((r) => r.slug);
    },
    [],
  );

  return data;
}
