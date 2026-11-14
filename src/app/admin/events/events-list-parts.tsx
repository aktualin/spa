import Link from "next/link";

import { EVENT_PHASE_LABEL, eventPhase, type EventPhase } from "@/lib/domain/events";

import type { listEvents } from "../actions/events";
import { Badge, Thumb, type BadgeTone } from "../promos/_kit/list-ui";
import { formatWibDate } from "../promos/_kit/schema";

export const TABS = [
  { key: "semua", label: "Semua" },
  { key: "upcoming", label: "Akan datang" },
  { key: "past", label: "Sudah lewat" },
  { key: "kolaborasi", label: "Kolaborasi" },
  { key: "draf", label: "Draf" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

export const PHASE_TONE: Record<EventPhase, BadgeTone> = {
  upcoming: "green",
  ongoing: "amber",
  past: "muted",
  tba: "default",
};

export type EventRow = Awaited<ReturnType<typeof listEvents>>[number] & {
  phase: EventPhase;
};

export function withPhases(events: Awaited<ReturnType<typeof listEvents>>, now: Date): EventRow[] {
  return events.map((event) => ({ ...event, phase: eventPhase(event, now) }));
}

export function matchesTab(row: EventRow, key: TabKey) {
  switch (key) {
    case "upcoming":
      return row.phase !== "past";
    case "past":
      return row.phase === "past" && !row.isCollaboration;
    case "kolaborasi":
      return row.isCollaboration;
    case "draf":
      return !row.isPublished;
    default:
      return true;
  }
}

export function formatRange(start: Date | null, end: Date | null): string {
  if (!start) return "Tanggal menyusul";
  const first = formatWibDate(start);
  const last = end ? formatWibDate(end) : first;
  return last === first ? first : `${first} – ${last}`;
}

/** Satu baris daftar event: thumb, badge fase/status, dan meta. */
export function EventListItem({ event }: { event: EventRow }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Thumb src={event.coverUrl} alt={event.title} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/events/${event.id}`}
              className="font-medium text-neutral-900 hover:underline"
            >
              {event.title}
            </Link>
            <Badge tone={PHASE_TONE[event.phase]}>
              {EVENT_PHASE_LABEL[event.phase]}
            </Badge>
            {event.isCollaboration ? (
              <Badge tone="blue">Kolaborasi</Badge>
            ) : null}
            {event.isPublished ? (
              <Badge tone="green">Tayang</Badge>
            ) : (
              <Badge tone="muted">Draf</Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            /events/{event.slug} · {formatRange(event.startDate, event.endDate)} ·{" "}
            {event._count.photos} foto
            {event.isCollaboration && event.partnerName
              ? ` · Mitra: ${event.partnerName}`
              : ""}
          </p>
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        {event.location ?? "—"} · Urutan {event.sortOrder}
      </p>
    </li>
  );
}