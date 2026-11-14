"use client";

import type { SiteSettingsInput } from "@/lib/domain/site-settings";

import { Field, inputClass } from "../_components/form-ui";

export function SocialFields({ values }: { values: SiteSettingsInput }) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-900">
        Media sosial &amp; booking online
      </legend>
      <p className="text-xs text-neutral-500">
        Isi alamat lengkap yang diawali <code>https://</code>. Field yang
        dikosongkan tidak ditampilkan di situs.
      </p>

      <Field label="Instagram" htmlFor="instagramUrl">
        <input
          id="instagramUrl"
          name="instagramUrl"
          type="url"
          defaultValue={values.instagramUrl}
          placeholder="https://www.instagram.com/..."
          className={inputClass}
        />
      </Field>

      <Field
        label="Username Instagram"
        htmlFor="instagramUsername"
        hint="Tanpa @ — tampil sebagai @username di bagian Instagram beranda."
      >
        <div className="flex items-stretch">
          <span className="flex items-center rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 px-3 text-sm text-neutral-500">
            @
          </span>
          <input
            id="instagramUsername"
            name="instagramUsername"
            defaultValue={values.instagramUsername}
            placeholder="kama__spa"
            autoCapitalize="none"
            spellCheck={false}
            className={`${inputClass} rounded-l-none`}
          />
        </div>
      </Field>

      <Field label="TikTok" htmlFor="tiktokUrl">
        <input
          id="tiktokUrl"
          name="tiktokUrl"
          type="url"
          defaultValue={values.tiktokUrl}
          placeholder="https://www.tiktok.com/@..."
          className={inputClass}
        />
      </Field>

      <Field label="Facebook" htmlFor="facebookUrl">
        <input
          id="facebookUrl"
          name="facebookUrl"
          type="url"
          defaultValue={values.facebookUrl}
          placeholder="https://www.facebook.com/..."
          className={inputClass}
        />
      </Field>

      <Field
        label="Fresha"
        htmlFor="freshaUrl"
        hint="Halaman booking Fresha. Bila diisi, tombol “Booking via Fresha” muncul di kartu cabang utama halaman kontak."
      >
        <input
          id="freshaUrl"
          name="freshaUrl"
          type="url"
          defaultValue={values.freshaUrl}
          placeholder="https://www.fresha.com/..."
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}