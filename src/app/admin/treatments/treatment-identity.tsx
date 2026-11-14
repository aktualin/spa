"use client";

import { Field, inputClass } from "../promos/_kit/form-ui";
import {
  ADDON_SECTIONS,
  type TreatmentCategoryOption,
  type TreatmentFormData,
} from "./treatment-form.types";

/** Nama, slug, kategori, letak add-on / tagline. */
export function IdentityFields({
  treatment,
  categories,
  categoryId,
  setCategoryId,
  isAddon,
}: {
  treatment: TreatmentFormData;
  categories: TreatmentCategoryOption[];
  categoryId: string;
  setCategoryId: (value: string) => void;
  isAddon: boolean;
}) {
  return (
    <>
      <Field label="Nama" htmlFor="name">
        <input
          id="name"
          name="name"
          defaultValue={treatment.name}
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
          defaultValue={treatment.slug}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className={inputClass}
        />
      </Field>

      <Field label="Kategori" htmlFor="categoryId">
        <select
          id="categoryId"
          name="categoryId"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          required
          className={inputClass}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {category.kind === "ADDON" ? " (add-on)" : ""}
            </option>
          ))}
        </select>
      </Field>

      {isAddon ? (
        <Field
          label="Letak di halaman Menu"
          htmlFor="addonSection"
          hint="Body tampil sebagai grid. Face, Head & Scalp, dan Bath masing-masing menampilkan satu add-on (yang urutannya paling atas)."
        >
          <select
            id="addonSection"
            name="addonSection"
            defaultValue={treatment.addonSection}
            required
            className={inputClass}
          >
            <option value="">— pilih letak —</option>
            {ADDON_SECTIONS.map((section) => (
              <option key={section.value} value={section.value}>
                {section.label}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <Field
          label="Tagline"
          htmlFor="tagline"
          hint="Kalimat singkat di kartu treatment halaman Menu."
        >
          <input
            id="tagline"
            name="tagline"
            defaultValue={treatment.tagline}
            maxLength={160}
            className={inputClass}
          />
        </Field>
      )}
    </>
  );
}