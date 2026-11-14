import Link from "next/link";

import { listTreatmentsByCategory } from "../../actions/treatments";
import { StatusBanner } from "../../settings/_components/form-ui";
import { CatalogTabs } from "../catalog-tabs";
import { AddonCategorySection } from "./addons-list";

export const instant = false;

export default async function AdminAddonsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [categories, params] = await Promise.all([
    listTreatmentsByCategory("ADDON"),
    searchParams,
  ]);
  const total = categories.reduce((sum, c) => sum + c.treatments.length, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <CatalogTabs active="addons" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Add-on</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {total} add-on. Tampil di bagian Layanan Tambahan halaman Menu, sesuai letak
            masing-masing.
          </p>
        </div>
        <Link
          href="/admin/treatments/new?kind=addon"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Tambah add-on
        </Link>
      </div>

      <StatusBanner
        saved={params.saved}
        deleted={params.deleted}
        deletedText="Add-on dihapus."
      />

      {categories.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-600">
          Belum ada kategori berjenis Add-on.{" "}
          <Link href="/admin/treatments/categories/new" className="underline">
            Buat kategori
          </Link>{" "}
          lalu pilih jenis &ldquo;Add-on&rdquo;.
        </p>
      ) : null}

      <div className="mt-6 space-y-8">
        {categories.map((category) => (
          <AddonCategorySection key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}