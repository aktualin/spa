import Link from "next/link";

import { requireRole } from "@/lib/auth";

import { listPackages } from "../../actions/packages";
import { CatalogTabs } from "../catalog-tabs";
import { PackageRow } from "./packages-list";

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
      <CatalogTabs active="packages" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Packages</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {packages.length} package (bundel treatment lintas kategori).
          </p>
        </div>
        <div className="flex gap-2">
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
            <PackageRow key={pkg.id} pkg={pkg} />
          ))}
        </ul>
      )}
    </div>
  );
}