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
        Location &amp; opening hours
      </legend>

      <Field
        label="Address"
        htmlFor="address"
        hint="Main branch address (South Jakarta) on the contact page."
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
            In Google Maps choose Share → Embed a map, then paste the URL or
            the entire <code>&lt;iframe&gt;</code> code; the system only
            stores the <code>https://www.google.com/maps/embed?…</code> URL.
            Leave empty if the map should not be shown.
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