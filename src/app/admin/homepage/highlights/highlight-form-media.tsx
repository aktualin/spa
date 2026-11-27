"use client";

import { HIGHLIGHT_LIMITS } from "@/lib/domain/homepage";

import { ImageField } from "../../image-field";
import { Field, inputClass } from "../../promos/_kit/form-ui";
import type { HighlightFormData } from "./highlight-form.types";

/** Fieldset gambar kartu highlight + alt text. */
export function HighlightImageFields({ highlight }: { highlight: HighlightFormData }) {
  return (
    <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-medium text-neutral-700">Image</legend>
      <ImageField
        name="imageUrl"
        label="Card image"
        folder="homepage"
        defaultValue={highlight.imageUrl}
      />
      <p className="text-xs text-neutral-500">
        Cropped to a 16:11 ratio. At least 1200×825 px recommended, JPG/WebP
        under 1 MB. Empty = a plain cream-colored box.
      </p>
      <Field
        label="Alt text (optional)"
        htmlFor="imageAlt"
        hint="The card title is already read out by screen readers, so alt may be left empty if the image is purely decorative."
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