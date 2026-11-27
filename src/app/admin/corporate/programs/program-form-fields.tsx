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
      <Field label="Program name" htmlFor="name" hint="Example: Essential, Signature, Executive.">
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
        label="Description"
        defaultValue={program.description}
        folder="corporate"
        compact
      />

      <StringListField
        name="features"
        legend="Features"
        hint="One feature per line, shown as a checklist. Empty lines are ignored."
        itemLabel="feature"
        placeholder="Example: Chair massage"
        defaultValue={program.features}
        max={maxFeatures}
      />

      <ImageField
        name="imageUrl"
        label="Program photo (optional, shown at the top of the card)"
        folder="corporate"
        defaultValue={program.imageUrl}
      />

      <Checkbox name="isPublished" defaultChecked={program.isPublished}>
        Show on website
      </Checkbox>
    </>
  );
}