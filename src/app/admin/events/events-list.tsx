import Link from "next/link";

import {
  EventListItem,
  TABS,
  matchesTab,
  type EventRow,
  type TabKey,
} from "./events-list-parts";

/** Tab filter event dengan jumlah per filter. */
export function EventTabs({ rows, tab }: { rows: EventRow[]; tab: TabKey }) {
  return (
    <nav aria-label="Saring event" className="mt-6 flex flex-wrap gap-2">
      {TABS.map((item) => {
        const active = item.key === tab;
        const count = rows.filter((row) => matchesTab(row, item.key)).length;
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
  );
}

/** Daftar event hasil filter. */
export function EventList({
  visible,
  total,
}: {
  visible: EventRow[];
  total: number;
}) {
  if (visible.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        {total === 0 ? "Belum ada event." : "Tidak ada event pada filter ini."}
      </p>
    );
  }
  return (
    <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {visible.map((event) => (
        <EventListItem key={event.id} event={event} />
      ))}
    </ul>
  );
}