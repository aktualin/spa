"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveCorporateContentAction, type ActionState } from "../../actions/corporate";
import { ErrorAlert, Field, SaveButton, inputClass } from "../../promos/_kit/form-ui";
import { RichTextField } from "../../rich-text-field";
import { StringListField } from "../_components/string-list-field";
import { SolutionsField } from "./solutions-field";

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
  limits,
}: {
  content: ContentFormData;
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

      <StringListField
        name="benefits"
        legend="Benefit (daftar centang di bagian #benefits)"
        hint="Satu benefit per baris. Daftar kosong = memakai benefit bawaan."
        itemLabel="benefit"
        placeholder="Contoh: Reduced stress and burnout"
        defaultValue={content.benefits}
        max={limits.maxBenefits}
      />

      <SolutionsField defaultValue={content.solutions} max={limits.maxSolutions} />

      <RichTextField
        name="inSpaHtml"
        label="Deskripsi In-Spa Corporate Experience"
        defaultValue={content.inSpaHtml}
        folder="corporate"
      />

      <StringListField
        name="inSpaItems"
        legend='Daftar "Ideal For" (In-Spa)'
        hint="Satu item per baris. Daftar kosong = memakai daftar bawaan."
        itemLabel="item"
        placeholder="Contoh: Team Wellness Days"
        defaultValue={content.inSpaItems}
        max={limits.maxInSpaItems}
      />

      <RichTextField
        name="inOfficeHtml"
        label="Catatan tambahan In-Office (opsional, tampil di bawah kartu program)"
        defaultValue={content.inOfficeHtml}
        folder="corporate"
      />

      <RichTextField
        name="stepsHtml"
        label="Catatan tambahan langkah kolaborasi (opsional, tampil di bawah langkah)"
        defaultValue={content.stepsHtml}
        folder="corporate"
      />

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
