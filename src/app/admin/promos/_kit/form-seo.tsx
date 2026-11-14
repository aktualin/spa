"use client";

import { Field, inputClass } from "./form-fields";

/** Field SEO dengan indikator panjang karakter (title ~60, description ~160). */
export function SeoFields({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-medium text-neutral-700">SEO</legend>
      <Field
        label="Meta title"
        htmlFor="seoTitle"
        hint="Kosongkan untuk memakai judul. Ideal ±60 karakter."
      >
        <input
          id="seoTitle"
          name="seoTitle"
          defaultValue={title}
          maxLength={120}
          className={inputClass}
        />
      </Field>
      <Field
        label="Meta description"
        htmlFor="seoDescription"
        hint="Ideal ±160 karakter."
      >
        <textarea
          id="seoDescription"
          name="seoDescription"
          defaultValue={description}
          maxLength={320}
          rows={3}
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}