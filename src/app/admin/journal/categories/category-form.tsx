"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  deleteJournalCategoryAction,
  saveJournalCategoryAction,
} from "../../actions/journal-categories";
import {
  ConfirmSubmit,
  ErrorMessage,
  SaveButton,
} from "../../settings/_components/form-ui";
import { CategoryOrderFields, NameSlugFields } from "./category-form-fields";
import { LIST_PATH, initialState, type JournalCategoryFormData } from "./category-form.types";

export type { JournalCategoryFormData } from "./category-form.types";

export function JournalCategoryForm({
  category,
  notEmpty = false,
}: {
  category: JournalCategoryFormData;
  notEmpty?: boolean;
}) {
  const [state, formAction] = useActionState(saveJournalCategoryAction, initialState);
  const isNew = category.id === null;
  const [slug, setSlug] = useState(category.slug);
  const [slugEdited, setSlugEdited] = useState(!isNew);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={LIST_PATH} className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar kategori
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {isNew ? "Tambah kategori journal" : `Ubah ${category.name}`}
      </h1>

      {notEmpty ? (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Kategori ini masih dipakai {category.postCount} artikel. Pindahkan
          artikelnya ke kategori lain dulu.
        </p>
      ) : null}

      <form action={formAction} className="mt-6 space-y-5">
        {category.id ? <input type="hidden" name="id" value={category.id} /> : null}

        <NameSlugFields
          category={category}
          slug={slug}
          setSlug={setSlug}
          slugEdited={slugEdited}
          setSlugEdited={setSlugEdited}
        />

        <CategoryOrderFields category={category} />

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href={LIST_PATH} className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {category.id ? (
        <div className="mt-8 border-t border-neutral-200 pt-4">
          {category.postCount > 0 ? (
            <p className="text-sm text-neutral-500">
              Kategori ini dipakai {category.postCount} artikel, jadi belum bisa
              dihapus. Pindahkan artikelnya ke kategori lain terlebih dahulu.
            </p>
          ) : (
            <form action={deleteJournalCategoryAction}>
              <input type="hidden" name="id" value={category.id} />
              <ConfirmSubmit message={`Hapus kategori "${category.name}"?`}>
                Hapus kategori ini
              </ConfirmSubmit>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}