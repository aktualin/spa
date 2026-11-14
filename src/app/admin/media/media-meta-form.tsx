"use client";

import { useActionState } from "react";

import { MAX_DISPLAY_NAME } from "@/lib/domain/media";

import { updateMediaAction, type ActionState } from "../actions/media";
import { ErrorAlert, Field, SaveButton, inputClass } from "../promos/_kit/form-ui";

export const initialState: ActionState = { error: null };

/** Ubah judul, alt text, dan nama file tampilan. */
export function MediaMetaForm({
  id,
  fileName,
  title,
  altText,
}: {
  id: string;
  fileName: string;
  title: string;
  altText: string;
}) {
  const [state, formAction] = useActionState(updateMediaAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />

      <Field
        label="Nama file"
        htmlFor="media-fileName"
        hint={`Nama tampilan di Media Library (maksimal ${MAX_DISPLAY_NAME} karakter, tanpa / atau \\). Alamat URL berkas tidak berubah.`}
      >
        <input
          id="media-fileName"
          name="fileName"
          defaultValue={fileName}
          required
          maxLength={MAX_DISPLAY_NAME}
          className={inputClass}
        />
      </Field>

      <Field label="Judul" htmlFor="media-title" hint="Opsional, membantu pencarian.">
        <input id="media-title" name="title" defaultValue={title} maxLength={200} className={inputClass} />
      </Field>

      <Field
        label="Teks alternatif (alt)"
        htmlFor="media-altText"
        hint="Deskripsi singkat isi gambar untuk pembaca layar dan mesin pencari."
      >
        <input id="media-altText" name="altText" defaultValue={altText} maxLength={300} className={inputClass} />
      </Field>

      <ErrorAlert message={state.error} />
      <SaveButton />
    </form>
  );
}