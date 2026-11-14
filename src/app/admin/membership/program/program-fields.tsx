"use client";

import { PROGRAM_LIMITS, type MembershipProgramData } from "@/lib/domain/membership";

import { Field, inputClass } from "../../promos/_kit/form-ui";
import { RichTextField } from "../../rich-text-field";

/** Eyebrow, judul, intro, kalimat harga, dan deskripsi banner program. */
export function ProgramHeaderFields({ program }: { program: MembershipProgramData }) {
  return (
    <>
      <Field label="Eyebrow" htmlFor="eyebrow" hint="Label kecil di atas judul.">
        <input id="eyebrow" name="eyebrow" defaultValue={program.eyebrow} required maxLength={PROGRAM_LIMITS.eyebrow} className={inputClass} />
      </Field>
      <Field label="Judul" htmlFor="title">
        <textarea id="title" name="title" defaultValue={program.title} required maxLength={PROGRAM_LIMITS.title} rows={2} className={inputClass} />
      </Field>
      <RichTextField
        name="intro"
        label="Intro"
        defaultValue={program.intro}
        folder="membership"
        hint={`Wajib diisi, maksimal ${PROGRAM_LIMITS.intro} karakter teks (format/HTML tidak dihitung).`}
        compact
      />
      <Field
        label="Kalimat harga"
        htmlFor="priceHeadline"
        hint='Contoh "Just Rp 1.5jt a month." Tampil di banner membership homepage dan bagian Main Benefits. Harga per tier diatur di tier atau modul Harga.'
      >
        <input id="priceHeadline" name="priceHeadline" defaultValue={program.priceHeadline} required maxLength={PROGRAM_LIMITS.priceHeadline} className={inputClass} />
      </Field>
      <Field
        label="Deskripsi banner homepage"
        htmlFor="bannerBody"
        hint="Teks di banner membership homepage. Bila diisi di modul Homepage (Banner Membership → subjudul), isian di sana yang dipakai."
      >
        <textarea id="bannerBody" name="bannerBody" defaultValue={program.bannerBody} required maxLength={PROGRAM_LIMITS.bannerBody} rows={3} className={inputClass} />
      </Field>
    </>
  );
}