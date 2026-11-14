"use client";

import { Field, inputClass } from "../settings/_components/form-ui";
import type { BranchFormData } from "./branch-form.types";

/** WhatsApp, telepon tampilan, dan email cabang (semua opsional). */
export function ContactFields({ branch }: { branch: BranchFormData }) {
  return (
    <>
      <Field
        label="Nomor WhatsApp (opsional)"
        htmlFor="whatsappNumber"
        hint="Kosongkan untuk memakai nomor di Kontak & Umum. Tulis 08xx atau +62xx."
      >
        <input
          id="whatsappNumber"
          name="whatsappNumber"
          defaultValue={branch.whatsappNumber}
          placeholder="0813-1605-2040"
          className={inputClass}
        />
      </Field>

      <Field
        label="Nomor telepon tampilan (opsional)"
        htmlFor="phone"
        hint="Kosongkan untuk menampilkan nomor WhatsApp di atas dalam format +62 8xx-xxxx-xxxx."
      >
        <input
          id="phone"
          name="phone"
          defaultValue={branch.phone}
          className={inputClass}
        />
      </Field>

      <Field label="Email (opsional)" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={branch.email}
          className={inputClass}
        />
      </Field>
    </>
  );
}