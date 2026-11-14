"use client";

import { ImageField } from "../../image-field";
import { Checkbox, Field, inputClass } from "../../promos/_kit/form-ui";
import { StringListField } from "../_components/string-list-field";
import { RichTextField } from "../../rich-text-field";
import type { ProgramFormData } from "./program-form";

/** Isian program In-Office: nama, deskripsi, fitur, foto, dan status tayang. */
export function ProgramFields({
  program,
  maxFeatures,
}: {
  program: ProgramFormData;
  maxFeatures: number;
}) {
  return (
    <>
      <Field label="Nama program" htmlFor="name" hint="Contoh: Essential, Signature, Executive.">
        <input
          id="name"
          name="name"
          defaultValue={program.name}
          required
          maxLength={80}
          className={inputClass}
        />
      </Field>

      <RichTextField
        name="description"
        label="Deskripsi"
        defaultValue={program.description}
        folder="corporate"
        compact
      />

      <StringListField
        name="features"
        legend="Fitur"
        hint="Satu fitur per baris, tampil sebagai daftar centang. Baris kosong diabaikan."
        itemLabel="fitur"
        placeholder="Contoh: Chair massage"
        defaultValue={program.features}
        max={maxFeatures}
      />

      <ImageField
        name="imageUrl"
        label="Foto program (opsional, tampil di atas kartu)"
        folder="corporate"
        defaultValue={program.imageUrl}
      />

      <Checkbox name="isPublished" defaultChecked={program.isPublished}>
        Tampilkan di website
      </Checkbox>
    </>
  );
}