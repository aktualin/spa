"use client";

import { slugify, SLUG_PATTERN } from "@/lib/domain/slug";

import { Field, inputClass } from "../../settings/_components/form-ui";
import type { CategoryFormData } from "./category-form.types";

/** Nama + slug kategori (slug baru mengikuti nama sampai diubah manual). */
export function NameSlugFields({
  category,
  slug,
  setSlug,
  slugEdited,
  setSlugEdited,
  slugChanged,
}: {
  category: CategoryFormData;
  slug: string;
  setSlug: (value: string) => void;
  slugEdited: boolean;
  setSlugEdited: (value: boolean) => void;
  slugChanged: boolean;
}) {
  const slugValid = SLUG_PATTERN.test(slug);
  return (
    <>
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
    </>
  );
}