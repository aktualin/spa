import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { formatIdr } from "@/lib/format";

import { listPackages } from "../../actions/packages";

export const instant = false;

export default async function AdminPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(["ADMIN", "EDITOR"]);

  const [packages, params] = await Promise.all([listPackages(), searchParams]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Packages</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {packages.length} package (bundel treatment lintas kategori).
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/treatments"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Kembali ke treatments
          </Link>
          <Link
            href="/admin/treatments/packages/new"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Tambah package
          </Link>
        </div>
      </div>

      {params.saved ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Package tersimpan.
        </p>
      ) : null}
      {params.deleted ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          Package dihapus.
        </p>
      ) : null}

      {packages.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Belum ada package. Tambahkan package pertama untuk membuat bundel
          treatment.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {packages.map((pkg) => (
            <li
              key={pkg.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/treatments/packages/${pkg.id}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {pkg.name}
                  </Link>
                  {!pkg.isPublished ? (
                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-600">
                      Draf
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  /{pkg.slug} ·{" "}
                  {pkg.items.length > 0
                    ? pkg.items
                        .map(
                          (item) =>
                            item.treatment?.name ?? item.label ?? "—",
                        )
                        .join(", ")
                    : "belum ada isi"}
                </p>
              </div>

              <p className="text-sm text-neutral-600">
                {pkg.durationMin ? `${pkg.durationMin} m · ` : ""}
                {formatIdr(pkg.priceIdr)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
