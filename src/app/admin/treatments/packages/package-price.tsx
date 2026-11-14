"use client";

import { Field, inputClass } from "../../promos/_kit/form-ui";
import type { PackageFormData } from "./package-form.types";

/** Harga, durasi menit, dan teks durasi package. */
export function PriceFields({ pkg }: { pkg: PackageFormData }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Harga (Rp)"
          htmlFor="priceIdr"
          hint="Rupiah penuh tanpa titik, contoh: 1500000."
        >
          <input
            id="priceIdr"
            name="priceIdr"
            defaultValue={pkg.priceIdr}
            required
            inputMode="numeric"
            className={inputClass}
          />
        </Field>

        <Field
          label="Durasi (menit)"
          htmlFor="durationMin"
          hint="Opsional. Kosongkan bila tidak ada durasi tetap."
        >
          <input
            id="durationMin"
            name="durationMin"
            defaultValue={pkg.durationMin}
            inputMode="numeric"
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Teks durasi"
        htmlFor="durationLabel"
        hint='Teks yang tampil di halaman Menu, contoh: "2 hours 30 minute". Kosong = dari durasi menit.'
      >
        <input
          id="durationLabel"
          name="durationLabel"
          defaultValue={pkg.durationLabel}
          maxLength={40}
          className={inputClass}
        />
      </Field>
    </>
  );
}