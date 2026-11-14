"use client";

import type { SiteSettingsInput } from "@/lib/domain/site-settings";

import { Field, inputClass } from "../_components/form-ui";

export function ContactFields({ values }: { values: SiteSettingsInput }) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-900">
        Kontak
      </legend>

      <Field
        label="Nomor WhatsApp booking"
        htmlFor="whatsappNumber"
        hint="Boleh ditulis 08xx atau +62xx; otomatis disimpan sebagai 628xx. Dipakai semua tombol WhatsApp di halaman kontak dan footer."
      >
        <input
          id="whatsappNumber"
          name="whatsappNumber"
          required
          defaultValue={values.whatsappNumber}
          inputMode="tel"
          placeholder="081316052040"
          className={inputClass}
        />
      </Field>

      <Field
        label="Email"
        htmlFor="email"
        hint="Dipakai ikon email di bagian “Connect with us” pada footer."
      >
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={values.email}
          className={inputClass}
        />
      </Field>

      <Field
        label="Telepon (opsional)"
        htmlFor="phone"
        hint="Nomor telepon biasa (bukan WhatsApp). Saat ini belum ditampilkan di situs."
      >
        <input
          id="phone"
          name="phone"
          defaultValue={values.phone}
          inputMode="tel"
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}