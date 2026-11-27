"use client";

import { JOURNAL_EXCERPT_MAX, journalPath, resolveJournalSlug } from "@/lib/domain/journal";

import { Field, inputClass } from "../promos/_kit/form-ui";
import type { JournalFormData } from "./journal-form.types";

/** Judul + slug (dengan peringatan ganti slug untuk artikel yang sudah tayang). */
export function TitleSlugFields({
  post,
  title,
  setTitle,
  slug,
  setSlug,
  effectiveSlug,
  slugChanged,
}: {
  post: JournalFormData;
  title: string;
  setTitle: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  effectiveSlug: string;
  slugChanged: boolean;
}) {
  return (
    <>
      <Field label="Article title" htmlFor="title">
        <input
          id="title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className={inputClass}
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint={
          <>
            Leave empty to generate automatically from the title. Lowercase letters, numbers, and hyphens.
            {effectiveSlug ? (
              <>
                {" "}Address: <code>{journalPath(effectiveSlug)}</code>
              </>
            ) : null}
            {slugChanged ? (
              <span className="mt-1 block text-amber-700">
                This article is already live on the website. Once saved, the old address{" "}
                <code>{journalPath(post.slug)}</code> will automatically redirect (301) to the new address.
              </span>
            ) : null}
          </>
        }
      >
        <input
          id="slug"
          name="slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder={resolveJournalSlug("", title) || undefined}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          maxLength={80}
          className={inputClass}
        />
      </Field>
    </>
  );
}

export function ExcerptField({
  excerpt,
  setExcerpt,
}: {
  excerpt: string;
  setExcerpt: (value: string) => void;
}) {
  return (
    <Field
      label="Summary (excerpt)"
      htmlFor="excerpt"
      hint={`Short text shown in the article list. ${excerpt.length}/${JOURNAL_EXCERPT_MAX} characters.`}
    >
      <textarea
        id="excerpt"
        name="excerpt"
        value={excerpt}
        onChange={(event) => setExcerpt(event.target.value)}
        maxLength={JOURNAL_EXCERPT_MAX}
        rows={3}
        className={inputClass}
      />
    </Field>
  );
}

