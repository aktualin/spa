import Link from "next/link";

import { listEvents } from "../actions/events";
import { Badge, PageHeader, StatusBanners, Thumb, primaryLinkClass } from "../promos/_kit/list-ui";
import { formatWibDate } from "../promos/_kit/schema";

export const instant = false;

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [events, params] = await Promise.all([listEvents(), searchParams]);

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
        {events.length === 0 ? (
          <p className="text-sm text-neutral-500">Belum ada event.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {events.map((event) => (
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
                      /{event.slug} · {formatWibDate(event.startDate)} ·{" "}
                      {event._count.photos} foto
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

      <p className="mt-6 text-xs text-neutral-500">
        Event dengan tanggal mulai di masa lalu otomatis masuk kelompok riwayat
        di halaman publik.
      </p>
    </div>
  );
}
