"use client";

import { RichTextField } from "../../rich-text-field";
import { StringListField } from "../_components/string-list-field";
import type { ContentFormData, ContentFormLimits } from "./content-form";
import { SolutionsField } from "./solutions-field";

/** Benefit, solusi, In-Spa, dan catatan tambahan konten corporate. */
export function ContentBodyFields({
  content,
  limits,
}: {
  content: ContentFormData;
  limits: ContentFormLimits;
}) {
  return (
    <>
      <StringListField
        name="benefits"
        legend="Benefit (daftar centang di bagian #benefits)"
        hint="Satu benefit per baris. Daftar kosong = memakai benefit bawaan."
        itemLabel="benefit"
        placeholder="Contoh: Reduced stress and burnout"
        defaultValue={content.benefits}
        max={limits.maxBenefits}
      />

      <SolutionsField defaultValue={content.solutions} max={limits.maxSolutions} />

      <RichTextField
        name="inSpaHtml"
        label="Deskripsi In-Spa Corporate Experience"
        defaultValue={content.inSpaHtml}
        folder="corporate"
      />

      <StringListField
        name="inSpaItems"
        legend='Daftar "Ideal For" (In-Spa)'
        hint="Satu item per baris. Daftar kosong = memakai daftar bawaan."
        itemLabel="item"
        placeholder="Contoh: Team Wellness Days"
        defaultValue={content.inSpaItems}
        max={limits.maxInSpaItems}
      />

      <RichTextField
        name="inOfficeHtml"
        label="Catatan tambahan In-Office (opsional, tampil di bawah kartu program)"
        defaultValue={content.inOfficeHtml}
        folder="corporate"
      />

      <RichTextField
        name="stepsHtml"
        label="Catatan tambahan langkah kolaborasi (opsional, tampil di bawah langkah)"
        defaultValue={content.stepsHtml}
        folder="corporate"
      />
    </>
  );
}