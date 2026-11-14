import Link from "next/link";

import { listEvents } from "../actions/events";
import { PageHeader, StatusBanners, primaryLinkClass } from "../promos/_kit/list-ui";
import { EventList, EventTabs } from "./events-list";
import { TABS, matchesTab, withPhases, type TabKey } from "./events-list-parts";
import { EventStatusRules } from "./status-rules";

export const instant = false;

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
  const rows = withPhases(events, now);
  const visible = rows.filter((row) => matchesTab(row, tab));

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

      <EventTabs rows={rows} tab={tab} />

      <div className="mt-4">
        <EventList visible={visible} total={events.length} />
      </div>
    </div>
  );
}