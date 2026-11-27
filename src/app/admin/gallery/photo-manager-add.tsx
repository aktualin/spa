"use client";

import { ImageField } from "../image-field";
import { ErrorAlert, Field, SaveButton, inputClass } from "../promos/_kit/form-ui";

/** Form tambah satu foto (dengan caption & alt text) ke album. */
export function AddPhotoSection({
  albumId,
  formAction,
  error,
}: {
  albumId: string;
  formAction: (formData: FormData) => void;
  error: string | null;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
        Add a single photo
      </h2>
      <p className="text-sm text-neutral-600">
        For one photo with its caption & alt text at once, or a photo that already
        exists in the Media Library.
      </p>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="albumId" value={albumId} />

        <ImageField
          name="imageUrl"
          label="Photo"
          folder="gallery"
          defaultValue=""
        />

        <Field label="Caption" htmlFor="caption">
          <input
            id="caption"
            name="caption"
            defaultValue=""
            className={inputClass}
          />
        </Field>

        <Field
          label="Alternative text (alt)"
          htmlFor="altText"
          hint="A short description of the photo for accessibility and SEO."
        >
          <input
            id="altText"
            name="altText"
            defaultValue=""
            className={inputClass}
          />
        </Field>

        <ErrorAlert message={error} />

        <SaveButton label="Add photo" />
      </form>
    </section>
  );
}