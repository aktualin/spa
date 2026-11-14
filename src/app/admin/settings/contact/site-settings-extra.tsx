"use client";

import { MAX_MENU_SCANS, type SiteSettingsInput } from "@/lib/domain/site-settings";

import { Field, inputClass } from "../_components/form-ui";

export function MenuScanFields({ values }: { values: SiteSettingsInput }) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-900">
        Halaman menu (scan &amp; PDF)
      </legend>

      <Field
        label="Gambar halaman menu"
        htmlFor="menuScanUrls"
        hint={`Satu URL gambar per baris, urut sesuai tampil (maks. ${MAX_MENU_SCANS}). Ambil URL https:// dari Media Library.`}
      >
        <textarea
          id="menuScanUrls"
          name="menuScanUrls"
          defaultValue={values.menuScanUrls.join("\n")}
          rows={4}
          placeholder="https://.../menu-01.jpg"
          className={inputClass}
        />
      </Field>

      <Field
        label="Berkas PDF menu"
        htmlFor="menuPdfUrl"
        hint="URL https:// (unggah PDF ke Media Library atau tautan Google Drive). Kosongkan bila tidak ada PDF."
      >
        <input
          id="menuPdfUrl"
          name="menuPdfUrl"
          defaultValue={values.menuPdfUrl}
          placeholder="https://.../menu.pdf"
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}

export function AnalyticsFields({ values }: { values: SiteSettingsInput }) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-900">
        Analitik
      </legend>

      <Field
        label="GA4 Measurement ID"
        htmlFor="ga4MeasurementId"
        hint="Format G-XXXXXXXXXX (Google Analytics → Admin → Data streams). Saat ini hanya disimpan; pemasangan script Google Analytics menyusul."
      >
        <input
          id="ga4MeasurementId"
          name="ga4MeasurementId"
          defaultValue={values.ga4MeasurementId}
          placeholder="G-XXXXXXXXXX"
          autoCapitalize="characters"
          spellCheck={false}
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}