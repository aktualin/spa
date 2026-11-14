"use client";

import type { CorporateImageValues } from "../../actions/corporate";
import { ImageField } from "../../image-field";
import { Field, inputClass } from "../../promos/_kit/form-ui";

const SECTIONS = [
  { key: "hero", label: "Foto hero", hint: "Gambar besar di bagian atas halaman /corporate." },
  { key: "about", label: "Foto about", hint: "Gambar di bagian intro/about halaman /corporate." },
  { key: "inSpa", label: "Foto In-Spa", hint: "Gambar di bagian In-Spa Corporate Experience." },
] as const;

/** Tiga pasang foto section + teks alt untuk halaman /corporate. */
export function ContentImageFields({ values }: { values: CorporateImageValues }) {
  return (
    <fieldset className="space-y-5 rounded-md border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-medium text-neutral-700">Foto halaman</legend>
      <p className="text-xs text-neutral-500">
        Unggah lewat Media Library (URL https://). Kosongkan bila bagian ini
        tidak perlu foto. Alt dipakai pembaca layar dan saat gambar gagal dimuat.
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