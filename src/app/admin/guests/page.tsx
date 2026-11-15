import Link from "next/link";

import { getGuests } from "../actions/guests";
import { requirePageAccess } from "../access";
import { PageHeader, StatusBanners, primaryLinkClass } from "../promos/_kit/list-ui";
import { formatWibDateTime } from "../promos/_kit/schema";
import { GuestDeleteButton } from "./guest-delete";

export const instant = false;

/** Pencatatan Tamu (modul 23). Data pribadi (UU PDP) — internal tim saja. */
export default async function AdminGuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requirePageAccess("/admin/guests");

  const [guests, params] = await Promise.all([getGuests(), searchParams]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Tamu"
        subtitle={`${guests.length} tamu tercatat. Data pribadi (UU PDP) — hanya untuk tim, jangan dibagikan ke luar dashboard.`}
        action={
          <Link href="/admin/guests/new" className={primaryLinkClass}>
            Tambah Tamu
          </Link>
        }
      />

      <StatusBanners
        saved={params.saved}
        deleted={params.deleted}
        deletedLabel="Tamu dihapus."
      />

      {guests.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Belum ada tamu tercatat. Klik “Tambah Tamu” untuk mencatat tamu pertama.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-2.5 font-medium">Nama</th>
                <th className="px-4 py-2.5 font-medium">Umur</th>
                <th className="px-4 py-2.5 font-medium">Jenis Kelamin</th>
                <th className="px-4 py-2.5 font-medium">Dibuat</th>
                <th className="px-4 py-2.5 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/guests/${guest.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {guest.nama ?? "—"}
                    </Link>
                    {guest._count.attributes > 0 ? (
                      <span className="ml-2 text-xs text-neutral-400">
                        {guest._count.attributes} atribut
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{guest.umur ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {guest.jenisKelamin ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {formatWibDateTime(guest.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/guests/${guest.id}/edit`}
                        className="text-sm text-neutral-700 hover:underline"
                      >
                        Edit
                      </Link>
                      <GuestDeleteButton id={guest.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
