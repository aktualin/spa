import Link from "next/link";

import { listJournalCategories, moveJournalCategoryAction } from "../../actions/journal-categories";
import { Badge, StatusBanner } from "../../settings/_components/form-ui";

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
            <li
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/journal/categories/${category.id}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {category.name}
                  </Link>
                  {!category.isPublished ? <Badge tone="warn">Disembunyikan</Badge> : null}
                </div>
                <p className="mt-0.5 font-mono text-xs text-neutral-500">{category.slug}</p>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm text-neutral-600">{category._count.posts} artikel</p>
                <div className="flex items-center gap-1">
                  <MoveButton id={category.id} direction="up" disabled={index === 0} />
                  <MoveButton
                    id={category.id}
                    direction="down"
                    disabled={index === categories.length - 1}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MoveButton({
  id,
  direction,
  disabled,
}: {
  id: string;
  direction: "up" | "down";
  disabled: boolean;
}) {
  const label = direction === "up" ? "Naikkan urutan" : "Turunkan urutan";
  return (
    <form action={moveJournalCategoryAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={label}
        title={label}
        className="rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-700 enabled:hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
      >
        {direction === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}
