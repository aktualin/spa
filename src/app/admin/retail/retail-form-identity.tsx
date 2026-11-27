"use client";

import { RETAIL_LIMITS } from "@/lib/domain/retail";

import { Field, inputClass } from "../settings/_components/form-ui";
import type { RetailFormData } from "./retail-form.types";

/** Nama + slug produk retail. */
export function RetailIdentityFields({ product }: { product: RetailFormData }) {
  return (
    <>
      <Field label="Name" htmlFor="name">
        <input
          id="name"
          name="name"
          defaultValue={product.name}
          required
          maxLength={RETAIL_LIMITS.name}
          className={inputClass}
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint="Unique product identifier. Lowercase letters, numbers, and hyphens, e.g. minyak-sukma-laya."
      >
        <input
          id="slug"
          name="slug"
          defaultValue={product.slug}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className={inputClass}
        />
      </Field>
    </>
  );
}