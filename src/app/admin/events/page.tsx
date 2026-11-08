import Link from "next/link";

import { EVENT_PHASE_LABEL, eventPhase, type EventPhase } from "@/lib/domain/events";

import { listEvents } from "../actions/events";
import {
  Badge,
  PageHeader,
  StatusBanners,
  Thumb,
  primaryLinkClass,
  type BadgeTone,
} from "../promos/_kit/list-ui";
import { formatWibDate } from "../promos/_kit/schema";
import { EventStatusRules } from "./status-rules";

export const instant = false;

const TABS = [
  { key: "semua", label: "Semua" },
  { key: "upcoming", label: "Akan datang" },
  { key: "past", label: "Sudah lewat" },
  { key: "kolaborasi", label: "Kolaborasi" },
  { key: "draf", label: "Draf" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const PHASE_TONE: Record<EventPhase, BadgeTone> = {
  upcoming: "green",
  ongoing: "amber",
  past: "muted",
  tba: "default",
};

function formatRange(start: Date | null, end: Date | null): string {
  if (!start) return "Tanggal menyusul";
  const first = formatWibDate(start);
  const last = end ? formatWibDate(end) : first;
  return last === first ? first : `${first} – ${last}`;
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; tab?: string }>;
}) {
  const [events, params] = await Promise.all([listEvents(), searchParams]);
  const tab: TabKey = TABS.some((t) => t.key === params.tab)
    ? (params.tab as TabKey)
    : "semua";

  const now = new Date();
  const rows = events.map((event) => ({ ...event, phase: eventPhase(event, now) }));

  const matches = (row: (typeof rows)[number], key: TabKey) => {
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
  };
  const visible = rows.filter((row) => matches(row, tab));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Events"
        subtitle={`${events.length} event terdaftar.`}
        action={
          <Link href="/admin/events/new" className={primaryLinkClass}>
            Tambah event
          </Link>
        }
      />

      <StatusBanners
        saved={params.saved}
        deleted={params.deleted}
        deletedLabel="Event dihapus."
      />

      <div className="mt-6">
        <EventStatusRules compact />
      </div>

      <nav aria-label="Saring event" className="mt-6 flex flex-wrap gap-2">
        {TABS.map((item) => {
          const active = item.key === tab;
          const count = rows.filter((row) => matches(row, item.key)).length;
          return (
            <Link
              key={item.key}
              href={item.key === "semua" ? "/admin/events" : `/admin/events?tab=${item.key}`}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-full bg-neutral-900 px-3 py-1 text-sm text-white"
                  : "rounded-full border border-neutral-300 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50"
              }
            >
              {item.label} ({count})
            </Link>
          );
        })}
      </nav>

      <div className="mt-4">
        {visible.length === 0 ? (
          <p className="text-sm text-neutral-500">
            {events.length === 0 ? "Belum ada event." : "Tidak ada event pada filter ini."}
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {visible.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
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
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
