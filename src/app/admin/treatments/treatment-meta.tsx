"use client";

import { Checkbox, Field, inputClass } from "../promos/_kit/form-ui";
import type { TreatmentFormData } from "./treatment-form.types";

/** Pesan WhatsApp, SEO, urutan tampil, dan flag New/Best Seller/tayang. */
export function MetaFields({ treatment }: { treatment: TreatmentFormData }) {
  return (
    <>
      <Field
        label="Pesan WhatsApp khusus"
        htmlFor="whatsappMessage"
        hint="Kosongkan untuk memakai template default."
      >
        <input
          id="whatsappMessage"
          name="whatsappMessage"
          defaultValue={treatment.whatsappMessage}
          className={inputClass}
        />
      </Field>

      <Field
        label="Judul SEO"
        htmlFor="seoTitle"
        hint="Judul di hasil pencarian Google. Kosongkan untuk memakai nama treatment."
      >
        <input
          id="seoTitle"
          name="seoTitle"
          defaultValue={treatment.seoTitle}
          className={inputClass}
        />
      </Field>

      <Field
        label="Deskripsi SEO"
        htmlFor="seoDescription"
        hint="Ringkasan di hasil pencarian Google, idealnya 120–160 karakter. Kosongkan untuk memakai deskripsi treatment."
      >
        <textarea
          id="seoDescription"
          name="seoDescription"
          rows={2}
          defaultValue={treatment.seoDescription}
          className={inputClass}
        />
      </Field>

      <Field label="Urutan tampil" htmlFor="sortOrder">
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={treatment.sortOrder}
          className={`${inputClass} w-28`}
        />
      </Field>

      <div className="space-y-2">
        <Checkbox name="isNew" defaultChecked={treatment.isNew}>
          Tandai sebagai <strong>New</strong>
        </Checkbox>
        <Checkbox name="isBestSeller" defaultChecked={treatment.isBestSeller}>
          Tandai sebagai <strong>Best Seller</strong>
        </Checkbox>
        <Checkbox name="isPublished" defaultChecked={treatment.isPublished}>
          Tampilkan di website
        </Checkbox>
      </div>
    </>
  );
}