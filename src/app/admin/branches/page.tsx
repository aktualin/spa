import Link from "next/link";

import { canMoveBranch } from "@/lib/domain/branch";

import {
  listBranches,
  moveBranchAction,
  toggleBranchPublishedAction,
} from "../actions/branches";
import { SmallSubmit } from "../promos/_kit/form-ui";
import { Badge, StatusBanner } from "../settings/_components/form-ui";

export const instant = false;

export default async function AdminBranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [branches, params] = await Promise.all([listBranches(), searchParams]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Cabang</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {branches.length} cabang. Tampil di halaman Kontak, pilihan lokasi
            pada form reservasi, dan form newsletter di footer. Nomor WhatsApp
            dan jam operasional yang dikosongkan mengikuti Kontak &amp; Umum.
          </p>
        </div>
        <Link
          href="/admin/branches/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Tambah cabang
        </Link>
      </div>

      <StatusBanner
        saved={params.saved}
        deleted={params.deleted}
        deletedText="Cabang dihapus."
      />

      {branches.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Belum ada cabang. Tambahkan minimal satu agar halaman Kontak dan
          pilihan lokasi pada form tidak kosong.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {branches.map((branch, index) => (
            <li
              key={branch.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/branches/${branch.id}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {branch.name} | {branch.area}
                  </Link>
                  {branch.tag ? <Badge>{branch.tag}</Badge> : null}
                  {!branch.isPublished ? <Badge tone="muted">Disembunyikan</Badge> : null}
                </div>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  /{branch.slug}
                  {branch.address ? ` · ${branch.address}` : " · alamat belum diisi"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <form action={moveBranchAction}>
                    <input type="hidden" name="id" value={branch.id} />
                    <input type="hidden" name="direction" value="up" />
                    <SmallSubmit
                      title={`Naikkan urutan ${branch.name}`}
                      disabled={!canMoveBranch(branches, index, "up")}
                    >
                      ↑
                    </SmallSubmit>
                  </form>
                  <form action={moveBranchAction}>
                    <input type="hidden" name="id" value={branch.id} />
                    <input type="hidden" name="direction" value="down" />
                    <SmallSubmit
                      title={`Turunkan urutan ${branch.name}`}
                      disabled={!canMoveBranch(branches, index, "down")}
                    >
                      ↓
                    </SmallSubmit>
                  </form>
                </div>
                <form action={toggleBranchPublishedAction}>
                  <input type="hidden" name="id" value={branch.id} />
                  <SmallSubmit
                    title={
                      branch.isPublished
                        ? `Sembunyikan ${branch.name} dari website`
                        : `Tampilkan ${branch.name} di website`
                    }
                  >
                    {branch.isPublished ? "Sembunyikan" : "Tampilkan"}
                  </SmallSubmit>
                </form>
                <Link
                  href={`/admin/branches/${branch.id}`}
                  className="text-neutral-800 underline"
                >
                  Ubah
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
