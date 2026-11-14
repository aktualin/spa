"use client";

import { Checkbox, Field, inputClass } from "./_kit/form-ui";
import type { PromoFormData } from "./promo-form.types";

/** Judul + slug promo. */
export function PromoIdentityFields({ promo }: { promo: PromoFormData }) {
  return (
    <>
      <Field label="Judul promo" htmlFor="title">
        <input
          id="title"
          name="title"
          defaultValue={promo.title}
          required
          className={inputClass}
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint="Dipakai di URL. Huruf kecil, angka, dan tanda hubung."
      >
        <input
          id="slug"
          name="slug"
          defaultValue={promo.slug}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className={inputClass}
        />
      </Field>
    </>
  );
}

/** Periode berlaku, urutan, pesan WhatsApp, dan status tayang. */
export function PromoPeriodFields({ promo }: { promo: PromoFormData }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Mulai berlaku"
          htmlFor="startDate"
          hint="Kosongkan bila langsung aktif."
        >
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={promo.startDate}
            className={inputClass}
          />
        </Field>

        <Field
          label="Berakhir"
          htmlFor="endDate"
          hint="Harus lebih besar dari tanggal mulai."
        >
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={promo.endDate}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Urutan tampil" htmlFor="sortOrder">
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={promo.sortOrder}
          className={`${inputClass} w-28`}
        />
      </Field>

      <Field
        label="Pesan WhatsApp khusus"
        htmlFor="whatsappMessage"
        hint="Kosongkan untuk memakai template default."
      >
        <input
          id="whatsappMessage"
          name="whatsappMessage"
          defaultValue={promo.whatsappMessage}
          className={inputClass}
        />
      </Field>

      <Checkbox name="isPublished" defaultChecked={promo.isPublished}>
        Tampilkan di website
      </Checkbox>
    </>
  );
}