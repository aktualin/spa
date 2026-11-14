"use client";

import Link from "next/link";

import { deleteCategoryAction } from "../../actions/categories";
import { ConfirmSubmit } from "../../settings/_components/form-ui";
import type { CategoryFormData } from "./category-form.types";

/** Judul form kategori + tautan kembali + peringatan masih berisi item. */
export function CategoryFormHeader({
  category,
  isNew,
  notEmpty,
}: {
  category: CategoryFormData;
  isNew: boolean;
  notEmpty: boolean;
}) {
  return (
    <>
      <Link href="/admin/treatments/categories" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar kategori
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {isNew ? "Tambah kategori" : `Ubah ${category.name}`}
      </h1>

      {notEmpty ? (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Kategori ini masih berisi {category.itemCount} item. Pindahkan atau hapus isinya dulu.
        </p>
      ) : null}
    </>
  );
}

/** Bagian hapus kategori (terkunci selama masih berisi item). */
export function CategoryDeleteSection({ category }: { category: CategoryFormData }) {
  return (
    <div className="mt-8 border-t border-neutral-200 pt-4">
      {category.itemCount > 0 ? (
        <p className="text-sm text-neutral-500">
          Kategori ini berisi {category.itemCount} item, jadi belum bisa dihapus. Pindahkan
          atau hapus isinya terlebih dahulu.
        </p>
      ) : (
        <form action={deleteCategoryAction}>
          <input type="hidden" name="id" value={category.id ?? ""} />
          <ConfirmSubmit message={`Hapus kategori "${category.name}"?`}>
            Hapus kategori ini
          </ConfirmSubmit>
        </form>
      )}
    </div>
  );
}