"use client";

import { JOURNAL_CATEGORY_MAX } from "@/lib/domain/journal";
import { slugify, SLUG_PATTERN } from "@/lib/domain/slug";

import { Field, inputClass } from "../../settings/_components/form-ui";
import type { JournalCategoryFormData } from "./category-form.types";

/** Nama + slug kategori journal (slug kosong mengikuti nama). */
export function NameSlugFields({
  category,
  slug,
  setSlug,
  slugEdited,
  setSlugEdited,
}: {
  category: JournalCategoryFormData;
  slug: string;
  setSlug: (value: string) => void;
  slugEdited: boolean;
  setSlugEdited: (value: boolean) => void;
}) {
  const slugValid = slug === "" || SLUG_PATTERN.test(slug);
  return (
    <>
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
    </>
  );
}

/** Urutan tampil + checkbox tayang. */
export function CategoryOrderFields({ category }: { category: JournalCategoryFormData }) {
  return (
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
  );
}