"use client";

import { Field, inputClass } from "../promos/_kit/form-ui";
import type { TierFormData } from "./membership-tier-form.types";

/** Nama, slug, label harga, dan catatan penagihan tier. */
export function TierIdentityFields({ tier }: { tier: TierFormData }) {
  return (
    <>
      <Field label="Tier name" htmlFor="name">
        <input
          id="name"
          name="name"
          defaultValue={tier.name}
          required
          className={inputClass}
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint="Used in the URL. Lowercase letters, numbers, and hyphens."
      >
        <input
          id="slug"
          name="slug"
          defaultValue={tier.slug}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className={inputClass}
        />
      </Field>

      <Field
        label="Price label"
        htmlFor="priceLabel"
        hint='e.g. "Rp 1.5M" or "Custom". The pricing sentence in the homepage banner is set separately in Membership program — update it too when the price changes.'
      >
        <input
          id="priceLabel"
          name="priceLabel"
          defaultValue={tier.priceLabel}
          required
          className={inputClass}
        />
      </Field>

      <Field
        label="Billing note"
        htmlFor="billingNote"
        hint="e.g. per month, minimum 3 months."
      >
        <input
          id="billingNote"
          name="billingNote"
          defaultValue={tier.billingNote}
          className={inputClass}
        />
      </Field>
    </>
  );
}