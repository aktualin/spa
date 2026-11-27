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
        legend="Benefits (checklist in the #benefits section)"
        hint="One benefit per line. An empty list = the default benefits are used."
        itemLabel="benefit"
        placeholder="Example: Reduced stress and burnout"
        defaultValue={content.benefits}
        max={limits.maxBenefits}
      />

      <SolutionsField defaultValue={content.solutions} max={limits.maxSolutions} />

      <RichTextField
        name="inSpaHtml"
        label="In-Spa Corporate Experience description"
        defaultValue={content.inSpaHtml}
        folder="corporate"
      />

      <StringListField
        name="inSpaItems"
        legend='"Ideal For" list (In-Spa)'
        hint="One item per line. An empty list = the default list is used."
        itemLabel="item"
        placeholder="Example: Team Wellness Days"
        defaultValue={content.inSpaItems}
        max={limits.maxInSpaItems}
      />

      <RichTextField
        name="inOfficeHtml"
        label="In-Office additional note (optional, shown below the program cards)"
        defaultValue={content.inOfficeHtml}
        folder="corporate"
      />

      <RichTextField
        name="stepsHtml"
        label="Collaboration steps additional note (optional, shown below the steps)"
        defaultValue={content.stepsHtml}
        folder="corporate"
      />
    </>
  );
}