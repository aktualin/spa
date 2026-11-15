import type { ReservationRequest } from "@prisma/client";

import { builtInMessage } from "@/lib/domain/whatsapp-template";
import { toWaNumber, waLink } from "@/lib/whatsapp";

import { formatWibDate, parseWibInput } from "../promos/_kit/schema";

/** "2026-11-18" + "14:00" → "18 Nov 2026, 14:00"; null bila keduanya kosong. */
export function formatReservationSchedule(
  preferredDate: string | null,
  preferredTime: string | null,
): string | null {
  const parsed = parseWibInput(preferredDate ?? undefined);
  const date = parsed instanceof Date ? formatWibDate(parsed) : null;
  if (date && preferredTime) return `${date}, ${preferredTime}`;
  return date ?? preferredTime ?? null;
}

/** Jumlah orang untuk tampilan; 6 = "6+" (opsi terakhir select form). */
export function formatGuests(guests: number | null): string {
  if (guests == null) return "—";
  return guests >= 6 ? "6+" : String(guests);
}

/** Ringkasan data permintaan reservasi (dl) di halaman detail admin. */
export function ReservationDetailList({ row }: { row: ReservationRequest }) {
  const waNumber = toWaNumber(row.phone);
  const schedule = formatReservationSchedule(row.preferredDate, row.preferredTime);

  return (
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
      <dt className="text-neutral-500">Jadwal</dt>
      <dd className="break-words text-neutral-900">{schedule ?? "—"}</dd>
      <dt className="text-neutral-500">Treatment</dt>
      <dd className="break-words text-neutral-900">{row.treatment ?? "—"}</dd>
      <dt className="text-neutral-500">Jumlah orang</dt>
      <dd className="break-words text-neutral-900">{formatGuests(row.guests)}</dd>
      <dt className="text-neutral-500">Pesan</dt>
      <dd className="whitespace-pre-wrap break-words text-neutral-900">{row.message ?? "—"}</dd>
    </dl>
  );
}
