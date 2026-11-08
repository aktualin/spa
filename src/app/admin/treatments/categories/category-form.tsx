"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { slugify, SLUG_PATTERN } from "@/lib/domain/slug";

import { deleteCategoryAction, saveCategoryAction, type ActionState } from "../../actions/categories";
import { ImageField } from "../../image-field";
import {
  ConfirmSubmit,
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../../settings/_components/form-ui";

export type CategoryFormData = {
  id: string | null;
  name: string;
  slug: string;
  kind: "TREATMENT" | "ADDON";
  description: string;
  imageUrl: string;
  sortOrder: number;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
  wasPublished: boolean;
  itemCount: number;
};

const initialState: ActionState = { error: null };

export function CategoryForm({
  category,
  notEmpty = false,
}: {
  category: CategoryFormData;
  notEmpty?: boolean;
}) {
  const [state, formAction] = useActionState(saveCategoryAction, initialState);
  const isNew = category.id === null;
  const [slug, setSlug] = useState(category.slug);
  const [slugEdited, setSlugEdited] = useState(!isNew);

  const slugValid = SLUG_PATTERN.test(slug);
  const slugChanged = category.wasPublished && !isNew && slug !== category.slug && slugValid;

  return (
    <div className="mx-auto max-w-2xl">
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

      <form action={formAction} className="mt-6 space-y-5">
        {category.id ? <input type="hidden" name="id" value={category.id} /> : null}

        <Field label="Nama" htmlFor="name">
          <input
            id="name"
            name="name"
            defaultValue={category.name}
            required
            maxLength={80}
            onChange={(event) => {
              if (!slugEdited) setSlug(slugify(event.target.value));
            }}
            className={inputClass}
          />
        </Field>

        <Field label="Slug" htmlFor="slug" hint="Huruf kecil, angka, dan tanda hubung.">
          <input
            id="slug"
            name="slug"
            value={slug}
            required
            maxLength={80}
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugEdited(true);
            }}
            className={`${inputClass} font-mono`}
          />
          <p className="mt-1 text-xs">
            {slugValid ? (
              <span className="text-neutral-500">
                Alamat: <code className="text-neutral-900">/treatments/{slug}</code>
              </span>
            ) : (
              <span className="text-red-700">
                Slug hanya boleh huruf kecil, angka, dan tanda hubung.
              </span>
            )}
          </p>
          {slugChanged ? (
            <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Alamat lama /treatments/{category.slug} beserta halaman treatment di dalamnya akan
              dialihkan permanen (301) ke alamat baru.
            </p>
          ) : null}
        </Field>

        <Field
          label="Jenis"
          htmlFor="kind"
          hint="Add-on tampil di bagian Layanan Tambahan halaman Menu, bukan di grid treatment utama."
        >
          <select id="kind" name="kind" defaultValue={category.kind} className={inputClass}>
            <option value="TREATMENT">Treatment</option>
            <option value="ADDON">Add-on</option>
          </select>
        </Field>

        <Field label="Deskripsi" htmlFor="description">
          <textarea
            id="description"
            name="description"
            defaultValue={category.description}
            rows={4}
            maxLength={2000}
            className={inputClass}
          />
        </Field>

        <ImageField name="imageUrl" label="Foto" folder="categories" defaultValue={category.imageUrl} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Urutan" htmlFor="sortOrder" hint="Makin kecil makin atas.">
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

        <Field label="Meta title" htmlFor="seoTitle" hint="Kosong = memakai nama kategori.">
          <input
            id="seoTitle"
            name="seoTitle"
            defaultValue={category.seoTitle}
            maxLength={70}
            className={inputClass}
          />
        </Field>
        <Field label="Meta description" htmlFor="seoDescription">
          <textarea
            id="seoDescription"
            name="seoDescription"
            defaultValue={category.seoDescription}
            rows={2}
            maxLength={200}
            className={inputClass}
          />
        </Field>

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/treatments/categories" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {category.id ? (
        <div className="mt-8 border-t border-neutral-200 pt-4">
          {category.itemCount > 0 ? (
            <p className="text-sm text-neutral-500">
              Kategori ini berisi {category.itemCount} item, jadi belum bisa dihapus. Pindahkan
              atau hapus isinya terlebih dahulu.
            </p>
          ) : (
            <form action={deleteCategoryAction}>
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
