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
        label="Footer tagline"
        htmlFor="footerTagline"
        hint="The big sentence in the footer. Leave empty to hide it."
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
        label="Footer membership CTA title"
        htmlFor="footerMembershipTitle"
        hint={`Membership call-to-action line above the footer, max. ${MAX_FOOTER_MEMBERSHIP_TITLE} characters.`}
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
          label="Learn More button label"
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
          label="Join button label"
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
        label="Partnership line"
        htmlFor="partnershipIntro"
        hint={`Shown before the partnership email address, max. ${MAX_PARTNERSHIP_INTRO} characters.`}
      >
        <input
          id="partnershipIntro"
          name="partnershipIntro"
          defaultValue={values.partnershipIntro}
          maxLength={MAX_PARTNERSHIP_INTRO}
          className={inputClass}
        />
      </Field>

      <Field label="Partnership email" htmlFor="partnershipEmail">
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