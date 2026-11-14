"use client";

import { useActionState } from "react";

import { saveOurStoryAction, type ActionState } from "../actions/our-story";
import { ErrorMessage, SaveButton } from "../settings/_components/form-ui";
import { HeroFields, OurStorySeoFields } from "./our-story-fields";

export type OurStoryFormData = {
  heroTitle: string;
  heroImageUrl: string;
  philosophyHtml: string;
  valuesHtml: string;
  seoTitle: string;
  seoDescription: string;
};

const initialState: ActionState = { error: null };

export function OurStoryForm({
  content,
  isNew = false,
}: {
  content: OurStoryFormData;
  /** true bila belum pernah disimpan: form berisi teks bawaan situs. */
  isNew?: boolean;
}) {
  const [state, formAction] = useActionState(saveOurStoryAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-neutral-900">Our Story</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Konten halaman <code>/our-story</code> beserta meta SEO-nya. Daftar
        tulisan terbaru di bagian bawah halaman diambil otomatis dari Journal.
      </p>

      {isNew ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Our Story belum pernah disimpan. Form ini berisi teks bawaan yang
          sekarang tampil di situs — ubah lalu tekan Simpan.
        </p>
      ) : null}

      <form action={formAction} className="mt-6 space-y-5">
        <HeroFields content={content} />
        <OurStorySeoFields content={content} />

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
        </div>
      </form>
    </div>
  );
}