"use client";

import { useActionState, useState } from "react";

import { saveSiteSettingsAction, type ActionState } from "../../actions/settings";
import {
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../_components/form-ui";

export type SiteSettingsFormData = {
  address: string;
  mapsEmbedUrl: string;
  whatsappNumber: string;
  email: string;
  phone: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  freshaUrl: string;
  openingHours: string[];
};

const initialState: ActionState = { error: null };

export function SiteSettingsForm({ settings }: { settings: SiteSettingsFormData }) {
  const [state, formAction] = useActionState(saveSiteSettingsAction, initialState);
  const [hours, setHours] = useState(
    settings.openingHours.length > 0 ? settings.openingHours : [""],
  );

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-neutral-900">
        Kontak &amp; Informasi Umum
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Data ini dipakai di halaman kontak, footer, dan tombol WhatsApp publik.
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        <Field label="Alamat" htmlFor="address">
          <textarea
            id="address"
            name="address"
            defaultValue={settings.address}
            rows={3}
            className={inputClass}
          />
        </Field>

        <Field
          label="URL embed Google Maps"
          htmlFor="mapsEmbedUrl"
          hint="Harus diawali https://www.google.com/maps/embed"
        >
          <input
            id="mapsEmbedUrl"
            name="mapsEmbedUrl"
            defaultValue={settings.mapsEmbedUrl}
            placeholder="https://www.google.com/maps/embed?pb=..."
            className={inputClass}
          />
        </Field>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-neutral-700">
            Jam operasional
          </legend>
          <p className="text-xs text-neutral-500">
            Satu baris per jam, contoh:{" "}
            <em>Senin–Jumat 09.00–21.00</em>.
          </p>
          {hours.map((value, index) => (
            <div key={index} className="flex flex-wrap gap-2">
              <input
                aria-label={`Jam operasional baris ${index + 1}`}
                name={`openingHours[${index}]`}
                value={value}
                onChange={(event) =>
                  setHours((rows) =>
                    rows.map((row, i) => (i === index ? event.target.value : row)),
                  )
                }
                className={`${inputClass} min-w-56 flex-1`}
              />
              <button
                type="button"
                onClick={() =>
                  setHours((rows) => rows.filter((_, i) => i !== index))
                }
                className="rounded-md border border-neutral-300 px-3 text-sm text-neutral-600 hover:bg-neutral-50"
              >
                Hapus
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setHours((rows) => [...rows, ""])}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            + Tambah jam
          </button>
        </fieldset>

        <Field
          label="Nomor WhatsApp"
          htmlFor="whatsappNumber"
          hint="Boleh ditulis 08xx; otomatis disimpan sebagai 628xx."
        >
          <input
            id="whatsappNumber"
            name="whatsappNumber"
            defaultValue={settings.whatsappNumber}
            inputMode="tel"
            placeholder="081316052040"
            className={inputClass}
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={settings.email}
            className={inputClass}
          />
        </Field>

        <Field label="Telepon" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            defaultValue={settings.phone}
            className={inputClass}
          />
        </Field>

        <Field label="Instagram" htmlFor="instagramUrl">
          <input
            id="instagramUrl"
            name="instagramUrl"
            defaultValue={settings.instagramUrl}
            placeholder="https://instagram.com/..."
            className={inputClass}
          />
        </Field>

        <Field label="TikTok" htmlFor="tiktokUrl">
          <input
            id="tiktokUrl"
            name="tiktokUrl"
            defaultValue={settings.tiktokUrl}
            placeholder="https://tiktok.com/@..."
            className={inputClass}
          />
        </Field>

        <Field label="Facebook" htmlFor="facebookUrl">
          <input
            id="facebookUrl"
            name="facebookUrl"
            defaultValue={settings.facebookUrl}
            placeholder="https://facebook.com/..."
            className={inputClass}
          />
        </Field>

        <Field label="Fresha" htmlFor="freshaUrl">
          <input
            id="freshaUrl"
            name="freshaUrl"
            defaultValue={settings.freshaUrl}
            placeholder="https://fresha.com/..."
            className={inputClass}
          />
        </Field>

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
        </div>
      </form>
    </div>
  );
}
