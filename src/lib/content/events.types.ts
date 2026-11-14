/** Tipe & pemetaan baris event publik — lihat `events.ts`. */
import { eventPhase, type EventPhase } from "@/lib/domain/events";

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

export const EMPTY: PublicEvent[] = [];

export const eventInclude = {
  photos: {
    orderBy: [{ sortOrder: "asc" as const }, { id: "asc" as const }],
    select: { id: true, imageUrl: true, caption: true },
  },
};

export type EventRow = Omit<PublicEvent, "phase">;

export function toRow(r: EventRow): EventRow {
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

export const withPhase = (row: EventRow, now: Date): PublicEvent => ({
  ...row,
  phase: eventPhase(row, now),
});