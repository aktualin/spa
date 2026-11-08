"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  saveCorporateContentAction,
  type ActionState,
} from "../actions/corporate";
import { RichTextField } from "../rich-text-field";
import {
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";

export type CorporateFormData = {
  heroTitle: string;
  intro: string;
  inOfficeHtml: string;
  inSpaHtml: string;
  stepsHtml: string;
  picName: string;
  picEmail: string;
  picPhone: string;
};

const initialState: ActionState = { error: null };

export function CorporateContentForm({ content }: { content: CorporateFormData }) {
  const [state, formAction] = useActionState(
    saveCorporateContentAction,
    initialState,
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            Corporate Wellness
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Konten program In-office / In-spa, langkah kolaborasi, dan data PIC.
          </p>
        </div>
        <Link
          href="/admin/corporate/inquiries"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          Lihat inquiry masuk
        </Link>
      </div>

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

        <Field label="Intro" htmlFor="intro">
          <textarea
            id="intro"
            name="intro"
            defaultValue={content.intro}
            rows={4}
            className={inputClass}
          />
        </Field>

        <RichTextField
          name="inOfficeHtml"
          label="Program In-office"
          defaultValue={content.inOfficeHtml}
          folder="corporate"
        />

        <RichTextField
          name="inSpaHtml"
          label="Program In-spa"
          defaultValue={content.inSpaHtml}
          folder="corporate"
        />

        <RichTextField
          name="stepsHtml"
          label="Langkah kolaborasi"
          defaultValue={content.stepsHtml}
          folder="corporate"
        />

        <Field label="Nama PIC" htmlFor="picName">
          <input
            id="picName"
            name="picName"
            defaultValue={content.picName}
            className={inputClass}
          />
        </Field>

        <Field label="Email PIC" htmlFor="picEmail">
          <input
            id="picEmail"
            name="picEmail"
            type="email"
            defaultValue={content.picEmail}
            className={inputClass}
          />
        </Field>

        <Field label="Telepon PIC" htmlFor="picPhone">
          <input
            id="picPhone"
            name="picPhone"
            defaultValue={content.picPhone}
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
