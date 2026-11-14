"use client";

import {
  MAX_FOOTER_MEMBERSHIP_LABEL,
  MAX_FOOTER_MEMBERSHIP_TITLE,
  MAX_FOOTER_TAGLINE,
  MAX_PARTNERSHIP_INTRO,
  type SiteSettingsInput,
} from "@/lib/domain/site-settings";

import { Field, inputClass } from "../_components/form-ui";

/** Isian teks footer & partnership (fragmen di dalam fieldset teks situs). */
export function FooterTextFields({ values }: { values: SiteSettingsInput }) {
  return (
    <>
      <Field
        label="Tagline footer"
        htmlFor="footerTagline"
        hint="Kalimat besar di footer. Kosongkan bila tidak ingin ditampilkan."
      >
        <textarea
          id="footerTagline"
          name="footerTagline"
          defaultValue={values.footerTagline}
          maxLength={MAX_FOOTER_TAGLINE}
          rows={2}
          className={inputClass}
        />
      </Field>

      <Field
        label="Judul CTA membership footer"
        htmlFor="footerMembershipTitle"
        hint={`Kalimat ajakan membership di atas footer, maks. ${MAX_FOOTER_MEMBERSHIP_TITLE} karakter.`}
      >
        <input
          id="footerMembershipTitle"
          name="footerMembershipTitle"
          defaultValue={values.footerMembershipTitle}
          maxLength={MAX_FOOTER_MEMBERSHIP_TITLE}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Label tombol Learn More"
          htmlFor="footerMembershipLearnLabel"
        >
          <input
            id="footerMembershipLearnLabel"
            name="footerMembershipLearnLabel"
            defaultValue={values.footerMembershipLearnLabel}
            maxLength={MAX_FOOTER_MEMBERSHIP_LABEL}
            className={inputClass}
          />
        </Field>
        <Field
          label="Label tombol Join"
          htmlFor="footerMembershipJoinLabel"
        >
          <input
            id="footerMembershipJoinLabel"
            name="footerMembershipJoinLabel"
            defaultValue={values.footerMembershipJoinLabel}
            maxLength={MAX_FOOTER_MEMBERSHIP_LABEL}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Kalimat partnership"
        htmlFor="partnershipIntro"
        hint={`Ditampilkan sebelum alamat email partnership, maks. ${MAX_PARTNERSHIP_INTRO} karakter.`}
      >
        <input
          id="partnershipIntro"
          name="partnershipIntro"
          defaultValue={values.partnershipIntro}
          maxLength={MAX_PARTNERSHIP_INTRO}
          className={inputClass}
        />
      </Field>

      <Field label="Email partnership" htmlFor="partnershipEmail">
        <input
          id="partnershipEmail"
          name="partnershipEmail"
          type="email"
          defaultValue={values.partnershipEmail}
          className={inputClass}
        />
      </Field>
    </>
  );
}