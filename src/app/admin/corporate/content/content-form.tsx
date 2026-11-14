"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  saveCorporateContentAction,
  type ActionState,
  type CorporateImageValues,
} from "../../actions/corporate";
import { ErrorAlert, Field, SaveButton, inputClass } from "../../promos/_kit/form-ui";
import { RichTextField } from "../../rich-text-field";
import { ContentBodyFields } from "./content-form-fields";
import { ContentImageFields } from "./content-image-fields";

export type ContentFormData = {
  heroTitle: string;
  intro: string;
  benefits: string[];
  solutions: { title: string; items: string[] }[];
  inSpaItems: string[];
  inSpaHtml: string;
  inOfficeHtml: string;
  stepsHtml: string;
};

export type ContentFormLimits = {
  maxBenefits: number;
  maxSolutions: number;
  maxInSpaItems: number;
};

const initialState: ActionState = { error: null };

export function CorporateContentForm({
  content,
  images,
  limits,
}: {
  content: ContentFormData;
  images: CorporateImageValues;
  limits: ContentFormLimits;
}) {
  const [state, formAction] = useActionState(saveCorporateContentAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <Field
        label="Judul hero"
        htmlFor="heroTitle"
        hint="Judul besar di bagian atas halaman /corporate."
      >
        <input
          id="heroTitle"
          name="heroTitle"
          defaultValue={content.heroTitle}
          required
          maxLength={200}
          className={inputClass}
        />
      </Field>

      <RichTextField
        name="intro"
        label="Intro"
        defaultValue={content.intro}
        folder="corporate"
        hint='Paragraf di bawah judul "Healthy Employees Build Stronger Companies". Kosongkan untuk memakai teks bawaan.'
        compact
      />

      <ContentImageFields values={images} />

      <ContentBodyFields content={content} limits={limits} />

      <ErrorAlert message={state.error} />

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
        <SaveButton />
        <Link href="/admin/corporate" className="text-sm text-neutral-600 hover:underline">
          Batal
        </Link>
      </div>
    </form>
  );
}
