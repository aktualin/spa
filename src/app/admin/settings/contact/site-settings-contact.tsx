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
        hint="Boleh ditulis 08xx atau +62xx; otomatis disimpan sebagai 628xx. Dipakai tombol WhatsApp booking: tombol melayang, drawer, reservasi, dan kartu cabang."
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
        label="Nomor WhatsApp kantor (opsional)"
        htmlFor="officeWhatsappNumber"
        hint="Ditampilkan bersama nomornya (mis. 0811 8807 2287) di bagian “Connect With Us” footer. Terpisah dari nomor booking di atas — kosongkan untuk menyembunyikannya dari footer."
      >
        <input
          id="officeWhatsappNumber"
          name="officeWhatsappNumber"
          defaultValue={values.officeWhatsappNumber}
          inputMode="tel"
          placeholder="081188072287"
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