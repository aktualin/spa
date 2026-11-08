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
        <Field
          label="Judul hero"
          htmlFor="heroTitle"
          hint="Judul besar di bagian atas halaman. Juga dipakai sebagai teks alt gambar hero."
        >
          <input
            id="heroTitle"
            name="heroTitle"
            defaultValue={content.heroTitle}
            required
            maxLength={160}
            className={inputClass}
          />
        </Field>

        <div className="space-y-1.5">
          <ImageField
            name="heroImageUrl"
            label="Gambar hero"
            folder="our-story"
            defaultValue={content.heroImageUrl}
          />
          <p className="text-xs text-neutral-500">
            Ditampilkan lebar dengan rasio 16:9 di bawah judul. Disarankan
            minimal 1920×1080 px, JPG/WebP di bawah 1 MB. Kosongkan untuk
            menyembunyikan gambar.
          </p>
        </div>

        <RichTextField
          name="philosophyHtml"
          label="Filosofi (bagian “Philosophy — Cara kami bekerja”)"
          defaultValue={content.philosophyHtml}
          folder="our-story"
        />

        <RichTextField
          name="valuesHtml"
          label="Nilai-nilai (bagian “Values — Yang kami pegang”)"
          defaultValue={content.valuesHtml}
          folder="our-story"
        />

        <Field
          label="SEO title"
          htmlFor="seoTitle"
          hint="Idealnya maksimal 60 karakter. Kosong = “Our Story”. Bila /our-story diatur di modul SEO, isian modul SEO yang dipakai."
        >
          <input
            id="seoTitle"
            name="seoTitle"
            defaultValue={content.seoTitle}
            maxLength={120}
            className={inputClass}
          />
        </Field>

        <Field
          label="SEO description"
          htmlFor="seoDescription"
          hint="Idealnya maksimal 160 karakter. Kosong = deskripsi bawaan halaman."
        >
          <textarea
            id="seoDescription"
            name="seoDescription"
            defaultValue={content.seoDescription}
            maxLength={320}
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
