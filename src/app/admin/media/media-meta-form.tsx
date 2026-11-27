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
        label="File name"
        htmlFor="media-fileName"
        hint={`Display name in the Media Library (maximum ${MAX_DISPLAY_NAME} characters, no / or \\). The file's URL address does not change.`}
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

      <Field label="Title" htmlFor="media-title" hint="Optional, helps with search.">
        <input id="media-title" name="title" defaultValue={title} maxLength={200} className={inputClass} />
      </Field>

      <Field
        label="Alternative text (alt)"
        htmlFor="media-altText"
        hint="A short description of the image content for screen readers and search engines."
      >
        <input id="media-altText" name="altText" defaultValue={altText} maxLength={300} className={inputClass} />
      </Field>

      <ErrorAlert message={state.error} />
      <SaveButton />
    </form>
  );
}