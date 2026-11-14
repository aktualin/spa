import Link from "next/link";

import { listJournalCategories } from "../../actions/journal-categories";
import { StatusBanner } from "../../settings/_components/form-ui";
import { JournalCategoryRow } from "./journal-categories-list";

export const instant = false;

export default async function AdminJournalCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [categories, params] = await Promise.all([listJournalCategories(), searchParams]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Kategori Journal</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Pengelompokan artikel. Urutan di sini menentukan urutan tombol filter
            di halaman Journal. Kategori yang belum dipakai artikel mana pun tidak
            ditampilkan di situs.
          </p>
        </div>
        <Link
          href="/admin/journal/categories/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Tambah kategori
        </Link>
      </div>

      <StatusBanner saved={params.saved} deleted={params.deleted} deletedText="Kategori dihapus." />

      {categories.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-600">
          Belum ada kategori. Artikel tanpa kategori tetap tampil, hanya tidak
          punya tombol filter.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {categories.map((category, index) => (
            <JournalCategoryRow
              key={category.id}
              category={category}
              index={index}
              count={categories.length}
            />
          ))}
        </ul>
      )}
    </div>
  );
}