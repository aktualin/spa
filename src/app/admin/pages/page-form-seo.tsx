"use client";

import { Field, inputClass } from "../settings/_components/form-ui";
import { SEO_DESCRIPTION_MAX, SEO_TITLE_MAX } from "./limits";

function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={over ? "font-medium text-red-700" : undefined}>
      {value.length}/{max}
    </span>
  );
}

/** Fieldset SEO halaman dengan penghitung karakter. */
export function PageSeoFields({
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
}: {
  seoTitle: string;
  setSeoTitle: (value: string) => void;
  seoDescription: string;
  setSeoDescription: (value: string) => void;
}) {
  return (
    <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-medium text-neutral-700">SEO</legend>
      <Field
        label="Meta title"
        htmlFor="seoTitle"
        hint={
          <>
            Kosongkan untuk memakai judul halaman.{" "}
            <Counter value={seoTitle} max={SEO_TITLE_MAX} />
          </>
        }
      >
        <input
          id="seoTitle"
          name="seoTitle"
          value={seoTitle}
          onChange={(event) => setSeoTitle(event.target.value)}
          className={inputClass}
        />
      </Field>
      <Field
        label="Meta description"
        htmlFor="seoDescription"
        hint={
          <>
            Ringkasan untuk hasil pencarian Google.{" "}
            <Counter value={seoDescription} max={SEO_DESCRIPTION_MAX} />
          </>
        }
      >
        <textarea
          id="seoDescription"
          name="seoDescription"
          value={seoDescription}
          onChange={(event) => setSeoDescription(event.target.value)}
          rows={3}
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}