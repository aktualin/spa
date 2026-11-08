"use client";

import { useActionState, useRef, useState } from "react";

import type { SiteSettingsInput } from "@/lib/domain/site-settings";

import {
  saveSiteSettingsAction,
  type SiteSettingsFormState,
} from "../../actions/settings";
import {
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../_components/form-ui";

export type SiteSettingsFormData = SiteSettingsInput;

const initialState: SiteSettingsFormState = { error: null };

const smallButton =
  "rounded-md border border-neutral-300 px-2.5 text-sm text-neutral-600 hover:bg-neutral-50 disabled:opacity-40";

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
        <fieldset className="space-y-5">
          <legend className="text-base font-semibold text-neutral-900">
            Lokasi &amp; jam buka
          </legend>

          <Field
            label="Alamat"
            htmlFor="address"
            hint="Alamat cabang utama (South Jakarta) di halaman kontak."
          >
            <textarea
              id="address"
              name="address"
              required
              defaultValue={values.address}
              rows={2}
              className={inputClass}
            />
          </Field>

          <OpeningHoursField initial={values.openingHours} max={maxHours} />

          <Field
            label="Google Maps embed"
            htmlFor="mapsEmbedUrl"
            hint={
              <>
                Di Google Maps pilih Share → Embed a map, lalu tempel URL atau
                seluruh kode <code>&lt;iframe&gt;</code>; sistem hanya
                menyimpan URL <code>https://www.google.com/maps/embed?…</code>.
                Kosongkan bila peta tidak ingin ditampilkan.
              </>
            }
          >
            <textarea
              id="mapsEmbedUrl"
              name="mapsEmbedUrl"
              defaultValue={values.mapsEmbedUrl}
              rows={2}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className={inputClass}
            />
          </Field>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="text-base font-semibold text-neutral-900">
            Kontak
          </legend>

          <Field
            label="Nomor WhatsApp booking"
            htmlFor="whatsappNumber"
            hint="Boleh ditulis 08xx atau +62xx; otomatis disimpan sebagai 628xx. Dipakai semua tombol WhatsApp di halaman kontak dan footer."
          >
            <input
              id="whatsappNumber"
              name="whatsappNumber"
              required
              defaultValue={values.whatsappNumber}
              inputMode="tel"
              placeholder="081316052040"
              className={inputClass}
            />
          </Field>

          <Field
            label="Email"
            htmlFor="email"
            hint="Dipakai ikon email di bagian “Connect with us” pada footer."
          >
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={values.email}
              className={inputClass}
            />
          </Field>

          <Field
            label="Telepon (opsional)"
            htmlFor="phone"
            hint="Nomor telepon biasa (bukan WhatsApp). Saat ini belum ditampilkan di situs."
          >
            <input
              id="phone"
              name="phone"
              defaultValue={values.phone}
              inputMode="tel"
              className={inputClass}
            />
          </Field>
        </fieldset>

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

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
        </div>
      </form>
    </div>
  );
}

/** Daftar baris jam operasional: tambah, hapus, dan ubah urutan. */
function OpeningHoursField({ initial, max }: { initial: string[]; max: number }) {
  const nextId = useRef(0);
  const makeRow = (value: string) => ({ id: nextId.current++, value });
  const [rows, setRows] = useState(() =>
    (initial.length > 0 ? initial : [""]).map(makeRow),
  );

  const move = (index: number, delta: -1 | 1) =>
    setRows((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-neutral-700">
        Jam operasional
      </legend>
      <p className="text-xs text-neutral-500">
        Satu baris per jadwal, contoh: <em>Mon – Sun. 10 AM – 8 PM</em>. Baris
        kosong diabaikan; minimal satu baris.
      </p>
      {rows.map((row, index) => (
        <div key={row.id} className="flex flex-wrap gap-2">
          <input
            aria-label={`Jam operasional baris ${index + 1}`}
            name={`openingHours[${index}]`}
            value={row.value}
            maxLength={120}
            onChange={(event) =>
              setRows((current) =>
                current.map((item) =>
                  item.id === row.id ? { ...item, value: event.target.value } : item,
                ),
              )
            }
            className={`${inputClass} min-w-56 flex-1`}
          />
          <button
            type="button"
            aria-label={`Naikkan baris ${index + 1}`}
            disabled={index === 0}
            onClick={() => move(index, -1)}
            className={smallButton}
          >
            ↑
          </button>
          <button
            type="button"
            aria-label={`Turunkan baris ${index + 1}`}
            disabled={index === rows.length - 1}
            onClick={() => move(index, 1)}
            className={smallButton}
          >
            ↓
          </button>
          <button
            type="button"
            disabled={rows.length === 1}
            onClick={() =>
              setRows((current) => current.filter((item) => item.id !== row.id))
            }
            className={`${smallButton} px-3`}
          >
            Hapus
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={rows.length >= max}
        onClick={() => setRows((current) => [...current, makeRow("")])}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
      >
        + Tambah baris
      </button>
    </fieldset>
  );
}
