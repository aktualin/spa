"use client";

import { useState } from "react";

import { slugify } from "@/lib/domain/slug";

import { Field, inputClass } from "../promos/_kit/form-ui";
import type { EventFormData } from "./event-form.types";

/** Judul + slug event (slug baru mengikuti judul sampai diubah manual). */
export function TitleSlugFields({
  values,
  publishedSlug,
}: {
  values: EventFormData;
  publishedSlug: string | null;
}) {
  const isNew = !values.id;
  const [slug, setSlug] = useState(values.slug);
  // Event baru: slug mengikuti judul sampai admin mengubah slug sendiri.
  const [slugTouched, setSlugTouched] = useState(!isNew || values.slug !== "");

  return (
    <>
      <Field label="Judul event" htmlFor="title">
        <input
          id="title"
          name="title"
          defaultValue={values.title}
          required
          maxLength={200}
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className={inputClass}
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint={
          <>
            Alamat halaman: <code>/events/{slug || "…"}</code>. Huruf kecil, angka, dan
            tanda hubung; harus unik.
            {publishedSlug && slug !== publishedSlug ? (
              <span className="mt-1 block text-amber-700">
                Slug diganti: alamat lama <code>/events/{publishedSlug}</code> otomatis
                dialihkan (301) ke alamat baru setelah disimpan.
              </span>
            ) : null}
          </>
        }
      >
        <input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value.trim());
          }}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className={inputClass}
        />
      </Field>
    </>
  );
}