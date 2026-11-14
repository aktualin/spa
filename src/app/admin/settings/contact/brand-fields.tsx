"use client";

import type { SiteSettingsInput } from "@/lib/domain/site-settings";

import { ImageField } from "../../image-field";
import { Field, inputClass } from "../_components/form-ui";

/** Identitas brand: mark header, lockup, wordmark, dan alt logo. */
export function BrandFields({ values }: { values: SiteSettingsInput }) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-900">Identitas brand</legend>
      <p className="text-xs text-neutral-500">
        Logo untuk header, footer, dan halaman masuk dashboard. Kosong = aset bawaan.
      </p>
      <ImageField
        name="logoMarkLightUrl"
        label="Mark logo terang (untuk latar gelap)"
        folder="brand"
        defaultValue={values.logoMarkLightUrl}
      />
      <ImageField
        name="logoMarkDarkUrl"
        label="Mark logo gelap (untuk latar terang)"
        folder="brand"
        defaultValue={values.logoMarkDarkUrl}
      />
      <ImageField
        name="logoLockupUrl"
        label="Lockup logo (mark + nama, untuk footer/hero)"
        folder="brand"
        defaultValue={values.logoLockupUrl}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Wordmark atas" htmlFor="brandWordmarkTop" hint="Maks. 20 karakter.">
          <input
            id="brandWordmarkTop"
            name="brandWordmarkTop"
            defaultValue={values.brandWordmarkTop}
            maxLength={20}
            placeholder="KAMA"
            className={inputClass}
          />
        </Field>
        <Field label="Wordmark bawah" htmlFor="brandWordmarkBottom" hint="Maks. 20 karakter.">
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
        label="Alt logo"
        htmlFor="brandLogoAlt"
        hint="Teks alternatif logo untuk pembaca layar, maks. 60 karakter."
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
    { name: "footerMembershipLearnHref", label: "Tujuan Learn More membership", placeholder: "/membership" },
    { name: "footerPrivacyHref", label: "Tujuan Privacy Policy", placeholder: "/privacy-policy" },
    { name: "footerTermsHref", label: "Tujuan Terms & Conditions", placeholder: "/terms" },
  ] as const;
  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-900">Tautan footer</legend>
      <p className="text-xs text-neutral-500">
        Path internal (/membership), anchor (#booking), atau URL https://.
        Tautan yang dikosongkan tidak ditampilkan di footer.
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