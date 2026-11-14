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
        Tombol (CTA)
      </legend>
      <p className="text-xs text-neutral-500">
        {ctaHint} Isi keduanya atau kosongkan keduanya.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label tombol" htmlFor={`ctaLabel-${id}`}>
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
          label="Tujuan tombol"
          htmlFor={`ctaHref-${id}`}
          hint="Path internal (/menu), anchor (#home_whats_new), atau https://…"
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