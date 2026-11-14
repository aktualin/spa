import Link from "next/link";

import { listTreatmentsByCategory } from "../actions/treatments";
import { CatalogTabs } from "./catalog-tabs";
import { CategorySection } from "./treatments-list";

export const instant = false;

export default async function AdminTreatmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [categories, params] = await Promise.all([
    listTreatmentsByCategory(),
    searchParams,
  ]);

  const total = categories.reduce((sum, c) => sum + c.treatments.length, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <CatalogTabs active="treatments" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Treatments</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {total} treatment dalam {categories.length} kategori. Tampil di halaman Menu
            dan Treatments.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/treatments/new"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Tambah treatment
          </Link>
        </div>
      </div>

      {params.saved ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Perubahan tersimpan.
        </p>
      ) : null}
      {params.deleted ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          Treatment dihapus.
        </p>
      ) : null}

      <div className="mt-6 space-y-8">
        {categories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}