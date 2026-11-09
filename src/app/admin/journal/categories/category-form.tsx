"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { slugify, SLUG_PATTERN } from "@/lib/domain/slug";
import { JOURNAL_CATEGORY_MAX } from "@/lib/domain/journal";

import {
  deleteJournalCategoryAction,
  saveJournalCategoryAction,
  type ActionState,
} from "../../actions/journal-categories";
import {
  ConfirmSubmit,
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../../settings/_components/form-ui";

export type JournalCategoryFormData = {
  id: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  isPublished: boolean;
  postCount: number;
};

const LIST_PATH = "/admin/journal/categories";
const initialState: ActionState = { error: null };

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

  const slugValid = slug === "" || SLUG_PATTERN.test(slug);

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

        <Field label="Nama" htmlFor="name" hint="Tampil sebagai chip filter dan label di kartu artikel.">
          <input
            id="name"
            name="name"
            defaultValue={category.name}
            required
            maxLength={JOURNAL_CATEGORY_MAX}
            onChange={(event) => {
              if (!slugEdited) setSlug(slugify(event.target.value));
            }}
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          hint="Dipakai sebagai penanda internal. Kosongkan untuk mengikuti nama."
        >
          <input
            id="slug"
            name="slug"
            value={slug}
            maxLength={80}
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugEdited(true);
            }}
            className={`${inputClass} font-mono`}
          />
          {slugValid ? null : (
            <p className="mt-1 text-xs text-red-700">
              Slug hanya boleh huruf kecil, angka, dan tanda hubung.
            </p>
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Urutan" htmlFor="sortOrder" hint="Makin kecil makin kiri pada baris filter.">
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={category.sortOrder}
              className={inputClass}
            />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={category.isPublished}
              className="size-4 rounded border-neutral-300"
            />
            Tampilkan di situs
          </label>
        </div>

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
