"use client";

import { Field, inputClass } from "../../settings/_components/form-ui";

/** Nilai teks SEO bawaan situs (kolom SiteSettings milik modul SEO). */
export type SeoDefaultsValues = {
  seoSiteName: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  seoOgDescription: string;
  seoOgLocale: string;
  seoTitleTemplate: string;
  seoKeywords: string[];
};

/** Form teks SEO bawaan: nama situs, judul/deskripsi, OG, locale, keywords. */
export function SeoDefaultsFields({ values }: { values: SeoDefaultsValues }) {
  return (
    <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-medium text-neutral-700">Teks SEO bawaan situs</legend>
      <p className="text-xs text-neutral-500">
        Dipakai saat halaman tidak punya meta sendiri. Kosongkan bila ingin memakai bawaan tema.
      </p>
      <Field label="Nama situs" htmlFor="seoSiteName" hint="Maks. 60 karakter, mis. KAMA Spa.">
        <input id="seoSiteName" name="seoSiteName" defaultValue={values.seoSiteName} maxLength={60} className={inputClass} />
      </Field>
      <Field label="Judul bawaan" htmlFor="seoDefaultTitle" hint="Maks. 120 karakter; ideal ±60.">
        <input id="seoDefaultTitle" name="seoDefaultTitle" defaultValue={values.seoDefaultTitle} maxLength={120} className={inputClass} />
      </Field>
      <Field
        label="Deskripsi bawaan"
        htmlFor="seoDefaultDescription"
        hint="Maks. 300 karakter; ideal ±160 untuk hasil pencarian."
      >
        <textarea
          id="seoDefaultDescription"
          name="seoDefaultDescription"
          defaultValue={values.seoDefaultDescription}
          maxLength={300}
          rows={3}
          className={inputClass}
        />
      </Field>
      <Field
        label="Deskripsi OG bawaan"
        htmlFor="seoOgDescription"
        hint="Tampil saat tautan dibagikan ke media sosial. Maks. 300 karakter."
      >
        <textarea
          id="seoOgDescription"
          name="seoOgDescription"
          defaultValue={values.seoOgDescription}
          maxLength={300}
          rows={2}
          className={inputClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Locale OG" htmlFor="seoOgLocale" hint="Mis. id_ID. Maks. 10 karakter.">
          <input id="seoOgLocale" name="seoOgLocale" defaultValue={values.seoOgLocale} maxLength={10} placeholder="id_ID" className={inputClass} />
        </Field>
        <Field label="Template judul" htmlFor="seoTitleTemplate" hint="Pakai %s untuk judul halaman, mis. %s | KAMA Spa.">
          <input id="seoTitleTemplate" name="seoTitleTemplate" defaultValue={values.seoTitleTemplate} maxLength={120} placeholder="%s | KAMA Spa" className={inputClass} />
        </Field>
      </div>
      <Field
        label="Keywords"
        htmlFor="seoKeywords"
        hint="Satu keyword per baris, maks. 20 butir (masing-masing maks. 40 karakter)."
      >
        <textarea
          id="seoKeywords"
          name="seoKeywords"
          defaultValue={values.seoKeywords.join("\n")}
          rows={4}
          placeholder={"spa jakarta\nmassage kemang"}
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}