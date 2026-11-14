"use client";

import {
  MAX_BOOK_NOW_LABEL,
  MAX_PRICE_DISCLAIMER,
  type SiteSettingsInput,
} from "@/lib/domain/site-settings";

import { Field, inputClass } from "../_components/form-ui";
import { FooterTextFields } from "./site-settings-footer-text";

export function SiteTextFields({ values }: { values: SiteSettingsInput }) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-900">
        Teks &amp; tombol situs
      </legend>
      <FooterTextFields values={values} />
      <BookingTextFields values={values} />
    </fieldset>
  );
}

/** Isian tombol Book Now & catatan harga (fragmen fieldset teks situs). */
function BookingTextFields({ values }: { values: SiteSettingsInput }) {
  return (
    <>
      <Field
        label="Label tombol Book Now"
        htmlFor="bookNowLabel"
        hint={`Teks tombol booking di header, maks. ${MAX_BOOK_NOW_LABEL} karakter.`}
      >            <input
          id="bookNowLabel"
          name="bookNowLabel"
          defaultValue={values.bookNowLabel}
          maxLength={MAX_BOOK_NOW_LABEL}
          placeholder="Book Now"
          className={inputClass}
        />
      </Field>

      <Field
        label="Tujuan tombol Book Now"
        htmlFor="bookNowHref"
        hint="Path internal (/contact), anchor (#booking), atau URL https://."
      >
        <input
          id="bookNowHref"
          name="bookNowHref"
          defaultValue={values.bookNowHref}
          placeholder="/contact"
          className={inputClass}
        />
      </Field>

      <Field
        label="Catatan harga di halaman menu"
        htmlFor="priceDisclaimer"
        hint={`Tampil di bawah daftar harga treatment. Maks. ${MAX_PRICE_DISCLAIMER} karakter.`}
      >
        <textarea
          id="priceDisclaimer"
          name="priceDisclaimer"
          defaultValue={values.priceDisclaimer}
          maxLength={MAX_PRICE_DISCLAIMER}
          rows={2}
          className={inputClass}
        />
      </Field>
    </>
  );
}