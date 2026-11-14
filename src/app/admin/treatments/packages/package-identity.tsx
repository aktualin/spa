"use client";

import { Field, inputClass } from "../../promos/_kit/form-ui";
import type { PackageFormData } from "./package-form.types";

/** Nama, slug, subjudul, dan kutipan package. */
export function IdentityFields({ pkg }: { pkg: PackageFormData }) {
  return (
    <>
      <Field label="Nama" htmlFor="name">
        <input
          id="name"
          name="name"
          defaultValue={pkg.name}
          required
          className={inputClass}
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint="Dipakai di URL. Huruf kecil, angka, dan tanda hubung."
      >
        <input
          id="slug"
          name="slug"
          defaultValue={pkg.slug}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className={inputClass}
        />
      </Field>

      <Field
        label="Subjudul"
        htmlFor="subtitle"
        hint='Tampil di atas nama paket, contoh: "A state of balance & inner resolution".'
      >
        <input
          id="subtitle"
          name="subtitle"
          defaultValue={pkg.subtitle}
          maxLength={160}
          className={inputClass}
        />
      </Field>
    </>
  );
}

/** Kutipan package (opsional, tampil miring di halaman detail). */
export function QuoteField({ pkg }: { pkg: PackageFormData }) {
  return (
    <Field label="Kutipan" htmlFor="quote" hint="Opsional, tampil miring di halaman detail paket.">
      <input
        id="quote"
        name="quote"
        defaultValue={pkg.quote}
        maxLength={200}
        className={inputClass}
      />
    </Field>
  );
}