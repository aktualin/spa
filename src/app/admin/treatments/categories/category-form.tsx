"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { SLUG_PATTERN } from "@/lib/domain/slug";

import { saveCategoryAction } from "../../actions/categories";
import { ImageField } from "../../image-field";
import {
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../../settings/_components/form-ui";
import { RichTextField } from "../../rich-text-field";
import { CategoryMetaFields } from "./category-form-meta";
import { CategoryDeleteSection, CategoryFormHeader } from "./category-form-parts";
import { NameSlugFields } from "./category-form-slug";
import { initialState, type CategoryFormData } from "./category-form.types";

export type { CategoryFormData } from "./category-form.types";

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
      <CategoryFormHeader category={category} isNew={isNew} notEmpty={notEmpty} />

      <form action={formAction} className="mt-6 space-y-5">
        {category.id ? <input type="hidden" name="id" value={category.id} /> : null}

        <NameSlugFields
          category={category}
          slug={slug}
          setSlug={setSlug}
          slugEdited={slugEdited}
          setSlugEdited={setSlugEdited}
          slugChanged={slugChanged}
        />

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

        <RichTextField
          name="description"
          label="Deskripsi"
          defaultValue={category.description}
          folder="categories"
          compact
        />

        <ImageField name="imageUrl" label="Foto" folder="categories" defaultValue={category.imageUrl} />

        <CategoryMetaFields category={category} />

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/treatments/categories" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {category.id ? <CategoryDeleteSection category={category} /> : null}
    </div>
  );
}