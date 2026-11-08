import Link from "next/link";

import { ADDON_SECTION_LABEL } from "@/lib/domain/menu-catalog";
import { formatIdr } from "@/lib/format";

import { listTreatmentsByCategory } from "../../actions/treatments";
import { Badge, StatusBanner } from "../../settings/_components/form-ui";
import { CatalogTabs } from "../catalog-tabs";

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
          <section key={category.id}>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {category.name}
              {!category.isPublished ? <Badge tone="muted">Kategori disembunyikan</Badge> : null}
            </h2>
            {category.treatments.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">Belum ada add-on di kategori ini.</p>
            ) : (
              <ul className="mt-2 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                {category.treatments.map((addon) => (
                  <li
                    key={addon.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/treatments/${addon.id}`}
                          className="font-medium text-neutral-900 hover:underline"
                        >
                          {addon.name}
                        </Link>
                        {addon.addonSection ? (
                          <Badge tone="muted">{ADDON_SECTION_LABEL[addon.addonSection]}</Badge>
                        ) : (
                          <Badge tone="warn">Belum ada letak — tidak tampil di Menu</Badge>
                        )}
                        {addon.isNew ? <Badge>New</Badge> : null}
                        {addon.isBestSeller ? <Badge>Best Seller</Badge> : null}
                        {!addon.isPublished ? <Badge tone="muted">Disembunyikan</Badge> : null}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600">
                      {addon.options
                        .map((o) => `${o.durationMin}m · ${formatIdr(o.priceIdr)}`)
                        .join("  |  ") || "belum ada harga"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
