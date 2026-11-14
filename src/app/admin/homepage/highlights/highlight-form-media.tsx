"use client";

import { HIGHLIGHT_LIMITS } from "@/lib/domain/homepage";

import { ImageField } from "../../image-field";
import { Field, inputClass } from "../../promos/_kit/form-ui";
import type { HighlightFormData } from "./highlight-form.types";

/** Fieldset gambar kartu highlight + alt text. */
export function HighlightImageFields({ highlight }: { highlight: HighlightFormData }) {
  return (
    <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-medium text-neutral-700">Gambar</legend>
      <ImageField
        name="imageUrl"
        label="Gambar kartu"
        folder="homepage"
        defaultValue={highlight.imageUrl}
      />
      <p className="text-xs text-neutral-500">
        Dipotong rasio 16:11. Disarankan minimal 1200×825 px, JPG/WebP di
        bawah 1 MB. Kosong = kotak polos berwarna krem.
      </p>
      <Field
        label="Teks alt (opsional)"
        htmlFor="imageAlt"
        hint="Judul kartu sudah dibacakan pembaca layar, jadi alt boleh dikosongkan bila gambar hanya hiasan."
      >
        <input
          id="imageAlt"
          name="imageAlt"
          defaultValue={highlight.imageAlt}
          maxLength={HIGHLIGHT_LIMITS.imageAlt}
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}