"use client";

import { PROGRAM_LIMITS, type MembershipProgramData } from "@/lib/domain/membership";

import { Field, inputClass } from "../../promos/_kit/form-ui";
import { RichTextField } from "../../rich-text-field";

/** Eyebrow, judul, intro, kalimat harga, dan deskripsi banner program. */
export function ProgramHeaderFields({ program }: { program: MembershipProgramData }) {
  return (
    <>
      <Field label="Eyebrow" htmlFor="eyebrow" hint="The small label above the title.">
        <input id="eyebrow" name="eyebrow" defaultValue={program.eyebrow} required maxLength={PROGRAM_LIMITS.eyebrow} className={inputClass} />
      </Field>
      <Field label="Title" htmlFor="title">
        <textarea id="title" name="title" defaultValue={program.title} required maxLength={PROGRAM_LIMITS.title} rows={2} className={inputClass} />
      </Field>
      <RichTextField
        name="intro"
        label="Intro"
        defaultValue={program.intro}
        folder="membership"
        hint={`Required, maximum ${PROGRAM_LIMITS.intro} characters of text (formatting/HTML not counted).`}
        compact
      />
      <Field
        label="Pricing sentence"
        htmlFor="priceHeadline"
        hint='e.g. "Just Rp 1,500,000 a month." Shown in the homepage membership banner and the Main Benefits section. Per-tier prices are set in the tier or the Pricing module.'
      >
        <input id="priceHeadline" name="priceHeadline" defaultValue={program.priceHeadline} required maxLength={PROGRAM_LIMITS.priceHeadline} className={inputClass} />
      </Field>
      <Field
        label="Homepage banner description"
        htmlFor="bannerBody"
        hint="The text in the homepage membership banner. If filled in the Homepage module (Membership Banner → subtitle), the value there is used instead."
      >
        <textarea id="bannerBody" name="bannerBody" defaultValue={program.bannerBody} required maxLength={PROGRAM_LIMITS.bannerBody} rows={3} className={inputClass} />
      </Field>
    </>
  );
}