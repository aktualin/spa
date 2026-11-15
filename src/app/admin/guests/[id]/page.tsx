import Link from "next/link";
import { notFound } from "next/navigation";

import { getGuestById } from "../../actions/guests";
import { requirePageAccess } from "../../access";
import { StatusBanners, primaryLinkClass } from "../../promos/_kit/list-ui";
import { formatWibDateTime } from "../../promos/_kit/schema";
import { GuestDeleteButton } from "../guest-delete";

export const instant = false;

/** Detail satu tamu: data utama + seluruh atribut key-value. */
export default async function AdminGuestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requirePageAccess("/admin/guests");

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const guest = await getGuestById(id);
  if (!guest) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/guests" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar tamu
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-neutral-900">
          {guest.nama ?? "(tanpa nama)"}
        </h1>
        <div className="flex items-center gap-3">
          <Link href={`/admin/guests/${guest.id}/edit`} className={primaryLinkClass}>
            Edit
          </Link>
          <GuestDeleteButton
            id={guest.id}
            className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
          />
        </div>
      </div>
      <p className="mt-1 text-sm text-neutral-600">
        Dibuat {formatWibDateTime(guest.createdAt)} · diperbarui{" "}
        {formatWibDateTime(guest.updatedAt)}. Data pribadi (UU PDP) — hanya untuk tim.
      </p>

      <StatusBanners saved={query.saved} />

      <dl className="mt-6 grid grid-cols-1 gap-x-4 gap-y-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm sm:grid-cols-[9rem_1fr]">
        <dt className="text-neutral-500">Nama</dt>
        <dd className="text-neutral-900">{guest.nama ?? "—"}</dd>
        <dt className="text-neutral-500">Umur</dt>
        <dd className="text-neutral-900">
          {guest.umur !== null ? `${guest.umur} tahun` : "—"}
        </dd>
        <dt className="text-neutral-500">Jenis Kelamin</dt>
        <dd className="text-neutral-900">{guest.jenisKelamin ?? "—"}</dd>
      </dl>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        Atribut Tambahan ({guest.attributes.length})
      </h2>
      {guest.attributes.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">
          Belum ada atribut tambahan. Tambahkan lewat tombol Edit.
        </p>
      ) : (
        <dl className="mt-3 divide-y divide-neutral-100 overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm">
          {guest.attributes.map((attr) => (
            <div
              key={attr.id}
              className="grid grid-cols-1 gap-x-4 px-4 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
            >
              <dt className="font-mono text-xs text-neutral-500">{attr.key}</dt>
              <dd className="break-words text-neutral-900">{attr.value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
