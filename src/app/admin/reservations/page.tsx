import Link from "next/link";

import { ListPagination } from "../_components/list-pagination";
import { requirePageAccess } from "../access";
import { listReservationRequests } from "../actions/reservations";
import { InquiryStatusBadge } from "../corporate/inquiries/status-badges";
import { PageHeader, StatusBanners } from "../promos/_kit/list-ui";
import { formatWibDateTime } from "../promos/_kit/schema";
import { formatReservationSchedule } from "./reservation-detail-list";

export const instant = false;

const FILTERS = [
  { value: undefined, label: "All" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "CLOSED", label: "Closed" },
] as const;

function listHref(status: string | null | undefined, page = 1): string {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return `/admin/reservations${qs ? `?${qs}` : ""}`;
}

/** Inbox permintaan reservasi dari form publik (/contact & /reservation). */
export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; status?: string; page?: string }>;
}) {
  await requirePageAccess("/admin/reservations");

  const params = await searchParams;
  const { rows, total, page, pageCount, status, countByStatus } = await listReservationRequests(params);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Reservations"
        subtitle={`${total} requests${status ? " on this filter" : ""} from the contact page form. Personal data (PDP Law) — for the team only, do not share outside the dashboard.`}
      />

      <StatusBanners deleted={params.deleted} deletedLabel="Reservation request deleted." />

      <nav aria-label="Status filter" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = (filter.value ?? null) === status;
          const count = filter.value ? countByStatus[filter.value] : null;
          return (
            <Link
              key={filter.label}
              href={listHref(filter.value)}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white"
                  : "rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
              }
            >
              {filter.label}
              {count !== null ? ` (${count})` : ""}
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No requests yet on this filter.</p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/admin/reservations/${row.id}`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-neutral-50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">
                    {row.name}
                    <span className="font-normal text-neutral-600"> · {row.phone}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {formatWibDateTime(row.createdAt)}
                    {row.branchSlug ? ` · branch ${row.branchSlug}` : ""}
                    {row.treatment ? ` · ${row.treatment}` : ""}
                    {row.preferredDate || row.preferredTime
                      ? ` · ${formatReservationSchedule(row.preferredDate, row.preferredTime)}`
                      : ""}
                  </p>
                </div>
                <InquiryStatusBadge status={row.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <ListPagination page={page} pageCount={pageCount} hrefFor={(p) => listHref(status, p)} />
    </div>
  );
}