/** Bacaan publik event — lihat `events.ts`. */
import { cacheLife, cacheTag } from "next/cache";

import { groupEvents } from "@/lib/domain/events";
import { safeQueryWithMeta } from "@/lib/safe-query";

import {
  EMPTY,
  type EventGroups,
  type PublicEvent,
  eventInclude,
  toRow,
  withPhase,
} from "./events.types";
import { CONTENT_TAGS } from "./tags";

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