"use client";

import {
  JOURNAL_SEO_DESCRIPTION_IDEAL,
  JOURNAL_SEO_DESCRIPTION_MAX,
  JOURNAL_SEO_TITLE_IDEAL,
  JOURNAL_SEO_TITLE_MAX,
} from "@/lib/domain/journal";

import { Field, inputClass } from "../promos/_kit/form-ui";
import { SeoCounter, SeoGooglePreview } from "./journal-seo-preview";

/** Fieldset SEO artikel + perkiraan tampilan di Google. */
export function JournalSeoFields({
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
  title,
  excerpt,
  effectiveSlug,
}: {
  seoTitle: string;
  setSeoTitle: (value: string) => void;
  seoDescription: string;
  setSeoDescription: (value: string) => void;
  title: string;
  excerpt: string;
  effectiveSlug: string;
}) {
  return (
    <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-medium text-neutral-700">SEO</legend>
      <Field
        label="Meta title"
        htmlFor="seoTitle"
        hint={
          <>
            Kosongkan untuk memakai judul artikel. Ideal ±{JOURNAL_SEO_TITLE_IDEAL}{" "}
            karakter. <SeoCounter value={seoTitle} ideal={JOURNAL_SEO_TITLE_IDEAL} />
          </>
        }
      >
        <input
          id="seoTitle"
          name="seoTitle"
          value={seoTitle}
          onChange={(event) => setSeoTitle(event.target.value)}
          maxLength={JOURNAL_SEO_TITLE_MAX}
          className={inputClass}
        />
      </Field>
      <Field
        label="Meta description"
        htmlFor="seoDescription"
        hint={
          <>
            Kosongkan untuk memakai ringkasan. Ideal ±{JOURNAL_SEO_DESCRIPTION_IDEAL}{" "}
            karakter.{" "}
            <SeoCounter value={seoDescription} ideal={JOURNAL_SEO_DESCRIPTION_IDEAL} />
          </>
        }
      >
        <textarea
          id="seoDescription"
          name="seoDescription"
          value={seoDescription}
          onChange={(event) => setSeoDescription(event.target.value)}
          maxLength={JOURNAL_SEO_DESCRIPTION_MAX}
          rows={3}
          className={inputClass}
        />
      </Field>

      <SeoGooglePreview
        seoTitle={seoTitle}
        seoDescription={seoDescription}
        title={title}
        excerpt={excerpt}
        effectiveSlug={effectiveSlug}
      />
    </fieldset>
  );
}