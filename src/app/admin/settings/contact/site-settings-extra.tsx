"use client";

import type { SiteSettingsInput } from "@/lib/domain/site-settings";

import { Field, inputClass } from "../_components/form-ui";

export function AnalyticsFields({ values }: { values: SiteSettingsInput }) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-900">
        Analytics
      </legend>

      <Field
        label="GA4 Measurement ID"
        htmlFor="ga4MeasurementId"
        hint="Format G-XXXXXXXXXX (Google Analytics → Admin → Data streams). Currently only stored; the Google Analytics script installation will follow."
      >
        <input
          id="ga4MeasurementId"
          name="ga4MeasurementId"
          defaultValue={values.ga4MeasurementId}
          placeholder="G-XXXXXXXXXX"
          autoCapitalize="characters"
          spellCheck={false}
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}