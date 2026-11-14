"use client";

import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import { Field, inputClass } from "../settings/_components/form-ui";
import type { OurStoryFormData } from "./our-story-form";

/** Judul + gambar hero Our Story. */
export function HeroFields({ content }: { content: OurStoryFormData }) {
  return (
    <>
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
    </>
  );
}

/** Meta SEO Our Story. */
export function OurStorySeoFields({ content }: { content: OurStoryFormData }) {
  return (
    <>
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
    </>
  );
}