"use client";

import type { SiteSettingsInput } from "@/lib/domain/site-settings";

import { Field, inputClass } from "../_components/form-ui";
import { OpeningHoursField } from "./site-settings-hours";

export function LocationFields({
  values,
  maxHours,
}: {
  values: SiteSettingsInput;
  maxHours: number;
}) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-900">
        Lokasi &amp; jam buka
      </legend>

      <Field
        label="Alamat"
        htmlFor="address"
        hint="Alamat cabang utama (South Jakarta) di halaman kontak."
      >
        <textarea
          id="address"
          name="address"
          required
          defaultValue={values.address}
          rows={2}
          className={inputClass}
        />
      </Field>

      <OpeningHoursField initial={values.openingHours} max={maxHours} />

      <Field
        label="Google Maps embed"
        htmlFor="mapsEmbedUrl"
        hint={
          <>
            Di Google Maps pilih Share → Embed a map, lalu tempel URL atau
            seluruh kode <code>&lt;iframe&gt;</code>; sistem hanya
            menyimpan URL <code>https://www.google.com/maps/embed?…</code>.
            Kosongkan bila peta tidak ingin ditampilkan.
          </>
        }
      >
        <textarea
          id="mapsEmbedUrl"
          name="mapsEmbedUrl"
          defaultValue={values.mapsEmbedUrl}
          rows={2}
          placeholder="https://www.google.com/maps/embed?pb=..."
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}