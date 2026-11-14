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
        Tambah satu foto
      </h2>
      <p className="text-sm text-neutral-600">
        Untuk satu foto dengan caption & alt text sekaligus, atau foto yang sudah
        ada di Media Library.
      </p>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="albumId" value={albumId} />

        <ImageField
          name="imageUrl"
          label="Foto"
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
          label="Teks alternatif (alt)"
          htmlFor="altText"
          hint="Deskripsi singkat foto untuk aksesibilitas dan SEO."
        >
          <input
            id="altText"
            name="altText"
            defaultValue=""
            className={inputClass}
          />
        </Field>

        <ErrorAlert message={error} />

        <SaveButton label="Tambah foto" />
      </form>
    </section>
  );
}