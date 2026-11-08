import Link from "next/link";

import { listCategories } from "../../actions/categories";
import { Badge, StatusBanner } from "../../settings/_components/form-ui";
import { CatalogTabs } from "../catalog-tabs";

export const instant = false;

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [categories, params] = await Promise.all([listCategories(), searchParams]);

  return (
    <div className="mx-auto max-w-4xl">
      <CatalogTabs active="categories" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Kategori</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Pengelompokan treatment dan add-on. Kategori berjenis Treatment punya halaman
            sendiri di <code>/treatments/&lt;slug&gt;</code>.
          </p>
        </div>
        <Link
          href="/admin/treatments/categories/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Tambah kategori
        </Link>
      </div>

      <StatusBanner saved={params.saved} deleted={params.deleted} deletedText="Kategori dihapus." />

      <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        {categories.map((category) => (
          <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/treatments/categories/${category.id}`}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  {category.name}
                </Link>
                <Badge tone="muted">{category.kind === "ADDON" ? "Add-on" : "Treatment"}</Badge>
                {!category.isPublished ? <Badge tone="warn">Disembunyikan</Badge> : null}
              </div>
              <p className="mt-0.5 font-mono text-xs text-neutral-500">/treatments/{category.slug}</p>
            </div>
            <p className="text-sm text-neutral-600">
              {category._count.treatments} item · urutan {category.sortOrder}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
