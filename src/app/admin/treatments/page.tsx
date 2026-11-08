import Link from "next/link";

import { formatIdr } from "@/lib/format";

import { listTreatmentsByCategory } from "../actions/treatments";
import { CatalogTabs } from "./catalog-tabs";

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
          <section key={category.id}>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {category.name}
              {!category.isPublished ? <Badge tone="muted">Kategori disembunyikan</Badge> : null}
            </h2>

            {category.treatments.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">
                Belum ada treatment di kategori ini.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                {category.treatments.map((treatment) => (
                  <li
                    key={treatment.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/treatments/${treatment.id}`}
                          className="font-medium text-neutral-900 hover:underline"
                        >
                          {treatment.name}
                        </Link>
                        {treatment.isNew ? <Badge>New</Badge> : null}
                        {treatment.isBestSeller ? (
                          <Badge>Best Seller</Badge>
                        ) : null}
                        {!treatment.isPublished ? (
                          <Badge tone="muted">Draf</Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        /{treatment.slug}
                      </p>
                    </div>

                    <p className="text-sm text-neutral-600">
                      {treatment.options
                        .map(
                          (option) =>
                            `${option.durationMin}m · ${formatIdr(option.priceIdr)}`,
                        )
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

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "muted";
}) {
  const className =
    tone === "muted"
      ? "bg-neutral-100 text-neutral-600"
      : "bg-neutral-900 text-white";
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}
