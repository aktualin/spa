"use client";

import { RETAIL_LIMITS } from "@/lib/domain/retail";

import { Checkbox, Field, inputClass } from "../settings/_components/form-ui";
import type { RetailFormData } from "./retail-form.types";

/** Harga, pesan WhatsApp, urutan, dan flag highlight/tayang. */
export function RetailMetaFields({ product }: { product: RetailFormData }) {
  return (
    <>
      <Field
        label="Price (optional)"
        htmlFor="priceIdr"
        hint="Full rupiah, e.g. 250000 or 250.000. Leave empty if the price is asked via WhatsApp — the website shows “Contact us”."
      >
        <input
          id="priceIdr"
          name="priceIdr"
          defaultValue={product.priceIdr}
          inputMode="numeric"
          placeholder="250000"
          className={`${inputClass} w-40`}
        />
      </Field>

      <Field
        label="Custom WhatsApp message"
        htmlFor="whatsappMessage"
        hint={
          <>
            Leave empty to use the “retail” template in Contact &amp; General →
            WhatsApp (default: “Halo kak, saya mau pesan produk [nama]” plus
            the price if any). You may use {"{{product}}"} and {"{{harga}}"}.
          </>
        }
      >
        <textarea
          id="whatsappMessage"
          name="whatsappMessage"
          defaultValue={product.whatsappMessage}
          rows={2}
          maxLength={RETAIL_LIMITS.whatsappMessage}
          className={inputClass}
        />
      </Field>

      <Field
        label="Display order"
        htmlFor="sortOrder"
        hint="Lower numbers appear higher. Leave empty to place new products at the end; the order can also be set with the ↑/↓ buttons in the list."
      >
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          step={1}
          defaultValue={product.sortOrder}
          className={`${inputClass} w-28`}
        />
      </Field>

      <div className="space-y-2">
        <Checkbox name="isHighlight" defaultChecked={product.isHighlight}>
          Mark as <strong>Highlight / Collaboration</strong> — appears at
          the very top with a “Highlight” label
        </Checkbox>
        <Checkbox name="isPublished" defaultChecked={product.isPublished}>
          Show on the website
        </Checkbox>
      </div>
    </>
  );
}