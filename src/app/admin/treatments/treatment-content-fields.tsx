"use client";

import { ImageField } from "../image-field";
import { MultiImageField } from "../multi-image-field";
import { Field, inputClass } from "../promos/_kit/form-ui";
import { RichTextField } from "../rich-text-field";
import type { TreatmentFormData } from "./treatment-form.types";

/** Deskripsi, catatan (non-add-on), gambar utama, dan galeri detail. */
export function TreatmentContentFields({
  treatment,
  isAddon,
}: {
  treatment: TreatmentFormData;
  isAddon: boolean;
}) {
  return (
    <>
      <RichTextField
        name="description"
        label="Deskripsi"
        defaultValue={treatment.description}
        folder="treatments"
        compact
      />

      {isAddon ? null : (
        <Field
          label="Catatan"
          htmlFor="note"
          hint='Opsional, tampil kecil di halaman detail. Contoh: "We are using dry massage techniques without oil."'
        >
          <input
            id="note"
            name="note"
            defaultValue={treatment.note}
            maxLength={200}
            className={inputClass}
          />
        </Field>
      )}

      <ImageField
        name="imageUrl"
        label="Gambar utama"
        folder="treatments"
        defaultValue={treatment.imageUrl}
      />

      <MultiImageField
        label="Galeri halaman detail"
        folder="treatments"
        defaultImages={treatment.contentImages}
      />
    </>
  );
}