"use client";

import { useActionState } from "react";

import type { SiteSettingsInput } from "@/lib/domain/site-settings";
import {
  saveSiteSettingsAction,
  type SiteSettingsFormState,
} from "../../actions/settings";
import { ErrorMessage, SaveButton } from "../_components/form-ui";
import { BrandFields, FooterLinkFields } from "./brand-fields";
import { ContactFields } from "./site-settings-contact";
import { AnalyticsFields, MenuScanFields } from "./site-settings-extra";
import { LocationFields } from "./site-settings-location";
import { SocialFields } from "./site-settings-social";
import { SiteTextFields } from "./site-settings-text";

export type SiteSettingsFormData = SiteSettingsInput;

const initialState: SiteSettingsFormState = { error: null };

export function SiteSettingsForm({
  settings,
  maxHours,
}: {
  settings: SiteSettingsFormData;
  maxHours: number;
}) {
  const [state, formAction] = useActionState(saveSiteSettingsAction, initialState);
  // Saat gagal, nilai yang dikirim dikembalikan server; form dipasang ulang
  // (key) supaya isian admin tidak hilang setelah React mereset form.
  const values = state.values ?? settings;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-neutral-900">
        Kontak &amp; Informasi Umum
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Data ini dipakai di halaman kontak, footer, dan tombol WhatsApp publik.
        Perubahan langsung tampil setelah disimpan.
      </p>

      <form action={formAction} className="mt-6 space-y-8" key={state.attempt ?? 0}>
        <LocationFields values={values} maxHours={maxHours} />
        <ContactFields values={values} />
        <SocialFields values={values} />
        <BrandFields values={values} />
        <SiteTextFields values={values} />
        <FooterLinkFields values={values} />
        <MenuScanFields values={values} />
        <AnalyticsFields values={values} />

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
        </div>
      </form>
    </div>
  );
}