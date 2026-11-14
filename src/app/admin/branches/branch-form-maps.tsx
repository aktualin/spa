"use client";

import { Field, inputClass } from "../settings/_components/form-ui";
import type { BranchFormData } from "./branch-form.types";

/** Embed Google Maps, tautan rute, dan koordinat cabang. */
export function MapsFields({ branch }: { branch: BranchFormData }) {
  return (
    <>
      <Field
        label="Embed Google Maps (opsional)"
        htmlFor="mapsEmbedUrl"
        hint="Tempel kode <iframe> dari Google Maps → Share → Embed a map, atau URL-nya langsung."
      >
        <textarea
          id="mapsEmbedUrl"
          name="mapsEmbedUrl"
          defaultValue={branch.mapsEmbedUrl}
          rows={2}
          className={inputClass}
        />
      </Field>

      <Field
        label="Tautan rute (opsional)"
        htmlFor="mapsUrl"
        hint="Tombol “Dapatkan Rute”. Kosongkan untuk membuatnya otomatis dari alamat."
      >
        <input
          id="mapsUrl"
          name="mapsUrl"
          defaultValue={branch.mapsUrl}
          placeholder="https://www.google.com/maps/dir/?api=1&destination=..."
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Lintang (latitude)"
          htmlFor="latitude"
          hint="Penanda di peta halaman Kontak."
        >
          <input
            id="latitude"
            name="latitude"
            defaultValue={branch.latitude}
            inputMode="decimal"
            placeholder="-6.2438873"
            className={inputClass}
          />
        </Field>
        <Field label="Bujur (longitude)" htmlFor="longitude" hint="Kosongkan keduanya bila cabang belum perlu tampil di peta.">
          <input
            id="longitude"
            name="longitude"
            defaultValue={branch.longitude}
            inputMode="decimal"
            placeholder="106.7935745"
            className={inputClass}
          />
        </Field>
      </div>
    </>
  );
}