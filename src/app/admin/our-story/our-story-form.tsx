"use client";

import { useActionState } from "react";

import { saveOurStoryAction, type ActionState } from "../actions/our-story";
import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import {
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";

export type OurStoryFormData = {
  heroTitle: string;
  heroImageUrl: string;
  philosophyHtml: string;
  valuesHtml: string;
  seoTitle: string;
  seoDescription: string;
};

const initialState: ActionState = { error: null };

export function OurStoryForm({ content }: { content: OurStoryFormData }) {
  const [state, formAction] = useActionState(saveOurStoryAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-neutral-900">Our Story</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Konten halaman Our Story beserta meta SEO-nya.
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        <Field label="Judul hero" htmlFor="heroTitle">
          <input
            id="heroTitle"
            name="heroTitle"
            defaultValue={content.heroTitle}
            required
            className={inputClass}
          />
        </Field>

        <ImageField
          name="heroImageUrl"
          label="Gambar hero"
          folder="our-story"
          defaultValue={content.heroImageUrl}
        />

        <RichTextField
          name="philosophyHtml"
          label="Filosofi"
          defaultValue={content.philosophyHtml}
          folder="our-story"
        />

        <RichTextField
          name="valuesHtml"
          label="Nilai-nilai"
          defaultValue={content.valuesHtml}
          folder="our-story"
        />

        <Field
          label="SEO title"
          htmlFor="seoTitle"
          hint="Idealnya maksimal 60 karakter."
        >
          <input
            id="seoTitle"
            name="seoTitle"
            defaultValue={content.seoTitle}
            className={inputClass}
          />
        </Field>

        <Field
          label="SEO description"
          htmlFor="seoDescription"
          hint="Idealnya maksimal 160 karakter."
        >
          <textarea
            id="seoDescription"
            name="seoDescription"
            defaultValue={content.seoDescription}
            rows={3}
            className={inputClass}
          />
        </Field>

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
        </div>
      </form>
    </div>
  );
}
