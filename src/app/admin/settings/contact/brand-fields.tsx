"use client";

import type { SiteSettingsInput } from "@/lib/domain/site-settings";

import { ImageField } from "../../image-field";
import { Field, inputClass } from "../_components/form-ui";

/** Identitas brand: mark header, lockup, wordmark, dan alt logo. */
export function BrandFields({ values }: { values: SiteSettingsInput }) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-900">Brand identity</legend>
      <p className="text-xs text-neutral-500">
        Logos for the header, footer, and dashboard sign-in page. Empty = default asset.
      </p>
      <ImageField
        name="logoMarkLightUrl"
        label="Light logo mark (for dark backgrounds)"
        folder="brand"
        defaultValue={values.logoMarkLightUrl}
      />
      <ImageField
        name="logoMarkDarkUrl"
        label="Dark logo mark (for light backgrounds)"
        folder="brand"
        defaultValue={values.logoMarkDarkUrl}
      />
      <ImageField
        name="logoLockupUrl"
        label="Logo lockup (mark + name, for footer/hero)"
        folder="brand"
        defaultValue={values.logoLockupUrl}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Top wordmark" htmlFor="brandWordmarkTop" hint="Max. 20 characters.">
          <input
            id="brandWordmarkTop"
            name="brandWordmarkTop"
            defaultValue={values.brandWordmarkTop}
            maxLength={20}
            placeholder="KAMA"
            className={inputClass}
          />
        </Field>
        <Field label="Bottom wordmark" htmlFor="brandWordmarkBottom" hint="Max. 20 characters.">
          <input
            id="brandWordmarkBottom"
            name="brandWordmarkBottom"
            defaultValue={values.brandWordmarkBottom}
            maxLength={20}
            placeholder="SPA"
            className={inputClass}
          />
        </Field>
      </div>
      <Field
        label="Logo alt"
        htmlFor="brandLogoAlt"
        hint="Alternative logo text for screen readers, max. 60 characters."
      >
        <input
          id="brandLogoAlt"
          name="brandLogoAlt"
          defaultValue={values.brandLogoAlt}
          maxLength={60}
          placeholder="KAMA Spa"
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}

/** Tujuan tautan struktural footer (Learn More, Privacy, Terms). */
export function FooterLinkFields({ values }: { values: SiteSettingsInput }) {
  const links = [
    { name: "footerMembershipLearnHref", label: "Membership Learn More destination", placeholder: "/membership" },
    { name: "footerPrivacyHref", label: "Privacy Policy destination", placeholder: "/privacy-policy" },
    { name: "footerTermsHref", label: "Terms & Conditions destination", placeholder: "/terms" },
  ] as const;
  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-900">Footer links</legend>
      <p className="text-xs text-neutral-500">
        Internal path (/membership), anchor (#booking), or https:// URL.
        Links left empty are not shown in the footer.
      </p>
      {links.map((link) => (
        <Field key={link.name} label={link.label} htmlFor={link.name}>
          <input
            id={link.name}
            name={link.name}
            defaultValue={values[link.name]}
            placeholder={link.placeholder}
            className={inputClass}
          />
        </Field>
      ))}
    </fieldset>
  );
}