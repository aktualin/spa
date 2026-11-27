"use client";

import { useActionState } from "react";

import { saveHomepageSectionAction } from "../actions/homepage";
import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import {
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";
import { initialState, type HomepageSectionRow } from "./homepage-section-shared";

/**
 * Form umum (judul, subjudul, isi, gambar) untuk section yang dibuat di luar
 * daftar key bawaan, dan untuk section bawaan yang teksnya memang dirender di
 * homepage (lihat `hasEditableText`). `withCta` menambah tombol ajakan.
 */
export function GenericSectionForm({
  section,
  withCta = false,
}: {
  section: HomepageSectionRow;
  withCta?: boolean;
}) {
  const [state, formAction] = useActionState(
    saveHomepageSectionAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <input type="hidden" name="id" value={section.id} />

      <Field label="Title" htmlFor={`title-${section.id}`}>
        <input
          id={`title-${section.id}`}
          name="title"
          defaultValue={section.title}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Subtitle" htmlFor={`subtitle-${section.id}`}>
        <input
          id={`subtitle-${section.id}`}
          name="subtitle"
          defaultValue={section.subtitle}
          className={inputClass}
        />
      </Field>

      <RichTextField
        name="bodyHtml"
        label="Body"
        defaultValue={section.bodyHtml}
        folder="homepage"
      />

      <ImageField
        name="imageUrl"
        label="Image"
        folder="homepage"
        defaultValue={section.imageUrl}
      />

      {withCta ? (
        <>
          <Field label="Button label" htmlFor={`ctaLabel-${section.id}`}>
            <input
              id={`ctaLabel-${section.id}`}
              name="ctaLabel"
              defaultValue={section.ctaLabel ?? ""}
              className={inputClass}
            />
          </Field>

          <Field label="Button destination" htmlFor={`ctaHref-${section.id}`}>
            <input
              id={`ctaHref-${section.id}`}
              name="ctaHref"
              defaultValue={section.ctaHref ?? ""}
              placeholder="#footer"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-neutral-500">
              Internal path (e.g. /menu), anchor (e.g. #footer), or an
              https://… address. Leave both empty to hide the button.
            </p>
          </Field>
        </>
      ) : null}

      <ErrorMessage error={state.error} />

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-3">
        <SaveButton label="Save section" />
      </div>
    </form>
  );
}