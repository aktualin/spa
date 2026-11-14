"use client";

import { Field, inputClass } from "../promos/_kit/form-ui";
import type { TierFormData } from "./membership-tier-form.types";

/** Nama, slug, label harga, dan catatan penagihan tier. */
export function TierIdentityFields({ tier }: { tier: TierFormData }) {
  return (
    <>
      <Field label="Nama tier" htmlFor="name">
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
        hint="Dipakai di URL. Huruf kecil, angka, dan tanda hubung."
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
        label="Label harga"
        htmlFor="priceLabel"
        hint='Contoh "Rp 1,5jt" atau "Custom". Kalimat harga di banner homepage diatur terpisah di Program membership — ubah juga bila harga berubah.'
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
        label="Catatan penagihan"
        htmlFor="billingNote"
        hint="Contoh: per bulan, minimal 3 bulan."
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