"use client";

import { Field, inputClass } from "../settings/_components/form-ui";
import { BANNER_LIMITS, type BannerDefaults } from "@/lib/domain/homepage-banner";
import type { HomepageSectionRow } from "./homepage-section-shared";

/** Fieldset tombol (CTA) banner: label + tujuan. */
export function BannerCtaFields({
  section,
  id,
  defaults,
  ctaHint,
}: {
  section: HomepageSectionRow;
  id: string;
  defaults: BannerDefaults;
  ctaHint: string;
}) {
  return (
    <fieldset className="space-y-4 rounded-md border border-neutral-200 p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Button (CTA)
      </legend>
      <p className="text-xs text-neutral-500">
        {ctaHint} Fill in both or leave both empty.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Button label" htmlFor={`ctaLabel-${id}`}>
          <input
            id={`ctaLabel-${id}`}
            name="ctaLabel"
            defaultValue={section.ctaLabel}
            maxLength={BANNER_LIMITS.ctaLabel}
            placeholder={defaults.ctaLabel}
            className={inputClass}
          />
        </Field>
        <Field
          label="Button destination"
          htmlFor={`ctaHref-${id}`}
          hint="Internal path (/menu), anchor (#home_whats_new), or https://…"
        >
          <input
            id={`ctaHref-${id}`}
            name="ctaHref"
            defaultValue={section.ctaHref}
            maxLength={BANNER_LIMITS.ctaHref}
            placeholder={defaults.ctaHref}
            className={inputClass}
          />
        </Field>
      </div>
    </fieldset>
  );
}