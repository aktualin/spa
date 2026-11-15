"use client";

import { GUEST_GENDERS, MAX_GUEST_AGE, MAX_GUEST_NAME } from "@/lib/domain/guests";

import { Field, inputClass } from "../promos/_kit/form-ui";
import type { GuestFormValues } from "./guest-form";

/** Field tetap form tamu: Nama, Umur, Jenis Kelamin. */
export function GuestFixedFields({ guest }: { guest?: GuestFormValues }) {
  return (
    <>
      <Field label="Nama" htmlFor="guest-nama">
        <input
          id="guest-nama"
          name="nama"
          defaultValue={guest?.nama ?? ""}
          required
          maxLength={MAX_GUEST_NAME}
          placeholder="Nama tamu"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Umur" htmlFor="guest-umur">
          <input
            id="guest-umur"
            name="umur"
            type="number"
            min={0}
            max={MAX_GUEST_AGE}
            defaultValue={guest?.umur ?? ""}
            placeholder="Opsional"
            className={inputClass}
          />
        </Field>

        <Field label="Jenis Kelamin" htmlFor="guest-gender">
          <select
            id="guest-gender"
            name="jenisKelamin"
            defaultValue={guest?.jenisKelamin ?? ""}
            className={inputClass}
          >
            <option value="">Pilih…</option>
            {GUEST_GENDERS.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </>
  );
}
