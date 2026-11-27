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
        label="Hero title"
        htmlFor="heroTitle"
        hint="The big heading at the top of the page. Also used as the alt text of the hero image."
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
          label="Hero image"
          folder="our-story"
          defaultValue={content.heroImageUrl}
        />
        <p className="text-xs text-neutral-500">
          Displayed wide with a 16:9 ratio below the title. Recommended at
          least 1920×1080 px, JPG/WebP under 1 MB. Leave empty to hide
          the image.
        </p>
      </div>

      <RichTextField
        name="philosophyHtml"
        label="Philosophy (the “Philosophy — How we work” section)"
        defaultValue={content.philosophyHtml}
        folder="our-story"
      />

      <RichTextField
        name="valuesHtml"
        label="Values (the “Values — What we stand for” section)"
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
        hint="Ideally a maximum of 60 characters. Empty = “Our Story”. If /our-story is configured in the SEO module, the SEO module value is used."
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
        hint="Ideally a maximum of 160 characters. Empty = the page's default description."
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