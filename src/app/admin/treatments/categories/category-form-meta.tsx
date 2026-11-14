"use client";

import { Field, inputClass } from "../../settings/_components/form-ui";
import type { CategoryFormData } from "./category-form.types";

/** Urutan, status tayang, dan meta SEO kategori. */
export function CategoryMetaFields({ category }: { category: CategoryFormData }) {
  return (
    <>
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
    </>
  );
}