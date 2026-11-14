"use client";

import { Checkbox, Field, inputClass } from "../../promos/_kit/form-ui";
import type { PackageFormData } from "./package-form.types";

/** Pesan WhatsApp, SEO, urutan tampil, dan flag New/Best Seller/tayang. */
export function MetaFields({ pkg }: { pkg: PackageFormData }) {
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
          defaultValue={pkg.whatsappMessage}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="SEO title" htmlFor="seoTitle">
          <input
            id="seoTitle"
            name="seoTitle"
            defaultValue={pkg.seoTitle}
            className={inputClass}
          />
        </Field>
        <Field label="SEO description" htmlFor="seoDescription">
          <input
            id="seoDescription"
            name="seoDescription"
            defaultValue={pkg.seoDescription}
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
          defaultValue={pkg.sortOrder}
          className={`${inputClass} w-28`}
        />
      </Field>

      <div className="flex flex-wrap gap-6">
        <Checkbox name="isNew" defaultChecked={pkg.isNew}>
          Tandai sebagai New
        </Checkbox>
        <Checkbox name="isBestSeller" defaultChecked={pkg.isBestSeller}>
          Tandai sebagai Best Seller
        </Checkbox>
        <Checkbox name="isPublished" defaultChecked={pkg.isPublished}>
          Tampilkan di website
        </Checkbox>
      </div>
    </>
  );
}