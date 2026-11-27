"use client";

import type { CorporateImageValues } from "../../actions/corporate";
import { ImageField } from "../../image-field";
import { Field, inputClass } from "../../promos/_kit/form-ui";

const SECTIONS = [
  { key: "hero", label: "Hero photo", hint: "Large image at the top of the /corporate page." },
  { key: "about", label: "About photo", hint: "Image in the intro/about section of the /corporate page." },
  { key: "inSpa", label: "In-Spa photo", hint: "Image in the In-Spa Corporate Experience section." },
] as const;

/** Tiga pasang foto section + teks alt untuk halaman /corporate. */
export function ContentImageFields({ values }: { values: CorporateImageValues }) {
  return (
    <fieldset className="space-y-5 rounded-md border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-medium text-neutral-700">Page photos</legend>
      <p className="text-xs text-neutral-500">
        Upload via the Media Library (https:// URL). Leave empty if this section
        needs no photo. Alt text is used by screen readers and when an image fails to load.
      </p>
      {SECTIONS.map((section) => {
        const urlKey = `${section.key}ImageUrl` as keyof CorporateImageValues;
        const altKey = `${section.key}ImageAlt` as keyof CorporateImageValues;
        const altId = `corporate-${section.key}-alt`;
        return (
          <div key={section.key} className="space-y-2 border-t border-neutral-100 pt-4 first:border-t-0 first:pt-0">
            <ImageField
              name={urlKey}
              label={section.label}
              folder="corporate"
              defaultValue={values[urlKey]}
            />
            <Field label={`Alt ${section.label.toLowerCase()}`} htmlFor={altId} hint={section.hint}>
              <input
                id={altId}
                name={altKey}
                defaultValue={values[altKey]}
                maxLength={160}
                className={inputClass}
              />
            </Field>
          </div>
        );
      })}
    </fieldset>
  );
}