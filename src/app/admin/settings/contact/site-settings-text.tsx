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
        Site text &amp; buttons
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
        label="Book Now button label"
        htmlFor="bookNowLabel"
        hint={`Booking button text in the header, max. ${MAX_BOOK_NOW_LABEL} characters.`}
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
        label="Book Now button destination"
        htmlFor="bookNowHref"
        hint="Internal path (/contact), anchor (#booking), or https:// URL."
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
        label="Price note on the menu page"
        htmlFor="priceDisclaimer"
        hint={`Shown below the treatment price list. Max. ${MAX_PRICE_DISCLAIMER} characters.`}
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