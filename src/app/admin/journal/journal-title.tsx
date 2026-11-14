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
      <Field label="Judul artikel" htmlFor="title">
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
            Kosongkan untuk dibuat otomatis dari judul. Huruf kecil, angka, dan tanda hubung.
            {effectiveSlug ? (
              <>
                {" "}Alamat: <code>{journalPath(effectiveSlug)}</code>
              </>
            ) : null}
            {slugChanged ? (
              <span className="mt-1 block text-amber-700">
                Artikel ini sudah tampil di website. Setelah disimpan, alamat lama{" "}
                <code>{journalPath(post.slug)}</code> otomatis dialihkan (301) ke alamat baru.
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
      label="Ringkasan (excerpt)"
      htmlFor="excerpt"
      hint={`Teks singkat yang tampil di daftar artikel. ${excerpt.length}/${JOURNAL_EXCERPT_MAX} karakter.`}
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

