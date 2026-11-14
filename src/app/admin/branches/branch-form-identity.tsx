"use client";

import { BRANCH_LIMITS } from "@/lib/domain/branch";
import { MAX_OPENING_HOURS } from "@/lib/domain/site-settings";

import { Field, inputClass } from "../settings/_components/form-ui";
import type { BranchFormData } from "./branch-form.types";

/** Nama, area, slug, label, alamat, dan jam operasional cabang. */
export function IdentityFields({ branch }: { branch: BranchFormData }) {
  return (
    <>
      <Field label="Nama cabang" htmlFor="name">
        <input
          id="name"
          name="name"
          defaultValue={branch.name}
          required
          maxLength={BRANCH_LIMITS.name}
          className={inputClass}
        />
      </Field>

      <Field
        label="Area"
        htmlFor="area"
        hint="Tampil setelah nama cabang, contoh: “South Jakarta | Kramat Pela”."
      >
        <input
          id="area"
          name="area"
          defaultValue={branch.area}
          required
          maxLength={BRANCH_LIMITS.area}
          className={inputClass}
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint="Penanda unik cabang. Huruf kecil, angka, dan tanda hubung, contoh: south-jakarta."
      >
        <input
          id="slug"
          name="slug"
          defaultValue={branch.slug}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className={inputClass}
        />
      </Field>

      <Field
        label="Label (opsional)"
        htmlFor="tag"
        hint="Penanda kecil di daftar admin, contoh: Flagship atau Coming Soon."
      >
        <input
          id="tag"
          name="tag"
          defaultValue={branch.tag}
          maxLength={BRANCH_LIMITS.tag}
          className={inputClass}
        />
      </Field>

      <Field label="Alamat" htmlFor="address">
        <textarea
          id="address"
          name="address"
          defaultValue={branch.address}
          rows={2}
          maxLength={BRANCH_LIMITS.address}
          className={inputClass}
        />
      </Field>

      <Field
        label="Jam operasional"
        htmlFor="openingHours"
        hint={`Satu baris per entri, maksimal ${MAX_OPENING_HOURS} baris. Kosongkan untuk mengikuti jam di Kontak & Umum.`}
      >
        <textarea
          id="openingHours"
          name="openingHours"
          defaultValue={branch.openingHours}
          rows={3}
          placeholder="Mon – Sun. 10 AM – 8 PM"
          className={inputClass}
        />
      </Field>
    </>
  );
}