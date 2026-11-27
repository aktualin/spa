"use client";

import type { SiteSettingsInput } from "@/lib/domain/site-settings";

import { Field, inputClass } from "../_components/form-ui";

export function ContactFields({ values }: { values: SiteSettingsInput }) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-900">
        Contact
      </legend>

      <Field
        label="Booking WhatsApp number"
        htmlFor="whatsappNumber"
        hint="Can be written as 08xx or +62xx; automatically saved as 628xx. Used by booking WhatsApp buttons: the floating button, drawer, reservations, and branch cards."
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
        label="Office WhatsApp number (optional)"
        htmlFor="officeWhatsappNumber"
        hint="Shown with its number (e.g. 0811 8807 2287) in the “Connect With Us” section of the footer. Separate from the booking number above — leave empty to hide it from the footer."
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
        hint="Used by the email icon in the “Connect with us” section of the footer."
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
        label="Phone (optional)"
        htmlFor="phone"
        hint="Regular phone number (not WhatsApp). Currently not shown on the site."
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