import Link from "next/link";
import { notFound } from "next/navigation";

import { builtInMessage } from "@/lib/domain/whatsapp-template";
import { toWaNumber, waLink } from "@/lib/whatsapp";

import { requirePageAccess } from "../../access";
import { deleteReservationAction, getReservationRequest } from "../../actions/reservations";
import { InquiryStatusBadge } from "../../corporate/inquiries/status-badges";
import { ConfirmDeleteButton } from "../../promos/_kit/form-ui";
import { StatusBanners } from "../../promos/_kit/list-ui";
import { formatWibDateTime } from "../../promos/_kit/schema";
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

  const waNumber = toWaNumber(row.phone);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/reservations" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar reservasi
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold text-neutral-900">{row.name}</h1>
        <InquiryStatusBadge status={row.status} />
      </div>
      <p className="mt-1 text-sm text-neutral-600">
        Masuk {formatWibDateTime(row.createdAt)}. Data pribadi (UU PDP) — gunakan hanya untuk
        menindaklanjuti permintaan ini.
      </p>

      <StatusBanners saved={query.saved} />

      <dl className="mt-6 grid grid-cols-1 gap-x-4 gap-y-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm sm:grid-cols-[9rem_1fr]">
        <dt className="text-neutral-500">Telepon</dt>
        <dd className="break-words text-neutral-900">
          {row.phone}
          {waNumber ? (
            <>
              {" · "}
              <a
                href={waLink(builtInMessage("default"), waNumber)}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                WhatsApp
              </a>
            </>
          ) : null}
        </dd>
        <dt className="text-neutral-500">Email</dt>
        <dd className="break-words">
          {row.email ? (
            <a href={`mailto:${row.email}`} className="text-neutral-900 underline">
              {row.email}
            </a>
          ) : (
            "—"
          )}
        </dd>
        <dt className="text-neutral-500">Cabang</dt>
        <dd className="break-words text-neutral-900">{row.branchSlug ?? "—"}</dd>
        <dt className="text-neutral-500">Pesan</dt>
        <dd className="whitespace-pre-wrap break-words text-neutral-900">{row.message ?? "—"}</dd>
      </dl>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Tindak lanjut</h2>
        <ReservationStatusForm
          reservationId={row.id}
          status={row.status}
          notes={row.notes ?? ""}
        />
      </section>

      <form action={deleteReservationAction} className="mt-8 border-t border-neutral-200 pt-4">
        <input type="hidden" name="id" value={row.id} />
        <ConfirmDeleteButton message="Hapus permintaan reservasi ini beserta seluruh data pengirimnya? Tindakan ini tidak bisa dibatalkan.">
          Hapus permintaan (spam / permintaan penghapusan data)
        </ConfirmDeleteButton>
      </form>
    </div>
  );
}