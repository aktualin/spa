import Link from "next/link";

import { listBranches } from "../actions/branches";
import { StatusBanner } from "../settings/_components/form-ui";
import { BranchRow } from "./branches-list";

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
            {branches.length} cabang. Tampil di halaman Kontak dan menjadi pilihan
            lokasi pada form reservasi di /contact serta form newsletter di footer.
            Kiriman kedua form masuk ke inbox{" "}
            <Link href="/admin/reservations" className="underline">
              Reservasi
            </Link>{" "}
            dan{" "}
            <Link href="/admin/newsletter" className="underline">
              Newsletter
            </Link>
            . Nomor WhatsApp dan jam operasional yang dikosongkan mengikuti
            Kontak &amp; Umum.
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
            <BranchRow key={branch.id} branch={branch} branches={branches} index={index} />
          ))}
        </ul>
      )}
    </div>
  );
}
