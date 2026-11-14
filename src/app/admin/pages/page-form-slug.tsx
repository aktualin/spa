"use client";

import { Field, inputClass } from "../settings/_components/form-ui";
import { autoSlug } from "./page-form.constants";

/** Judul + slug dengan pratinjau alamat dan peringatan redirect 301. */
export function TitleSlugFields({
  page,
  isNew,
  title,
  setTitle,
  slug,
  setSlug,
  slugEdited,
  setSlugEdited,
  slugError,
  previewUrl,
  slugChanged,
}: {
  page: { slug: string };
  isNew: boolean;
  title: string;
  setTitle: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  slugEdited: boolean;
  setSlugEdited: (value: boolean) => void;
  slugError: string | null;
  previewUrl: string | null;
  slugChanged: boolean;
}) {
  return (
    <>
      <Field label="Judul halaman" htmlFor="title">
        <input
          id="title"
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugEdited) setSlug(autoSlug(event.target.value));
          }}
          required
          className={inputClass}
        />
      </Field>

      <Field
        label="Slug (alamat URL)"
        htmlFor="slug"
        hint={
          isNew && !slugEdited
            ? "Terisi otomatis dari judul. Huruf kecil, angka, dan tanda hubung."
            : "Huruf kecil, angka, dan tanda hubung. Tanpa spasi atau garis miring."
        }
      >
        <input
          id="slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value);
            setSlugEdited(true);
          }}
          required
          autoComplete="off"
          spellCheck={false}
          aria-invalid={slugError ? true : undefined}
          aria-describedby="slug-preview"
          className={`${inputClass} font-mono`}
        />
        <p id="slug-preview" aria-live="polite" className="text-xs">
          {slugError ? (
            <span className="text-red-700">{slugError}</span>
          ) : previewUrl ? (
            <>
              <span className="text-neutral-500">Alamat halaman: </span>
              <span className="break-all font-mono text-neutral-900">{previewUrl}</span>
            </>
          ) : (
            <span className="text-neutral-500">Isi judul atau slug untuk melihat alamat.</span>
          )}
        </p>
      </Field>

      {slugChanged ? (
        <p
          role="status"
          className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          URL lama /{page.slug} akan dialihkan permanen (301) ke /{slug} setelah
          disimpan.
        </p>
      ) : null}
    </>
  );
}