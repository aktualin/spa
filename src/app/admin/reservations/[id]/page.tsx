import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePageAccess } from "../../access";
import { deleteReservationAction, getReservationRequest } from "../../actions/reservations";
import { InquiryStatusBadge } from "../../corporate/inquiries/status-badges";
import { ConfirmDeleteButton } from "../../promos/_kit/form-ui";
import { StatusBanners } from "../../promos/_kit/list-ui";
import { formatWibDateTime } from "../../promos/_kit/schema";
import { ReservationDetailList } from "../reservation-detail-list";
import { ReservationStatusForm } from "../reservation-status-form";

export const instant = false;

export default async function AdminReservationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requirePageAccess("/admin/reservations");

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const row = await getReservationRequest(id);
  if (!row) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/reservations" className="text-sm text-neutral-600 hover:underline">
        ← Back to the reservations list
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold text-neutral-900">{row.name}</h1>
        <InquiryStatusBadge status={row.status} />
      </div>
      <p className="mt-1 text-sm text-neutral-600">
        Received {formatWibDateTime(row.createdAt)}. Personal data (PDP Law) — use only to
        follow up on this request.
      </p>

      <StatusBanners saved={query.saved} />

      <ReservationDetailList row={row} />

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Follow-up</h2>
        <ReservationStatusForm
          reservationId={row.id}
          status={row.status}
          notes={row.notes ?? ""}
        />
      </section>

      <form action={deleteReservationAction} className="mt-8 border-t border-neutral-200 pt-4">
        <input type="hidden" name="id" value={row.id} />
        <ConfirmDeleteButton message="Delete this reservation request along with all of the sender's data? This action cannot be undone.">
          Delete request (spam / data erasure request)
        </ConfirmDeleteButton>
      </form>
    </div>
  );
}
