"use client";

import { ImageField } from "../../image-field";
import { Checkbox, Field, inputClass } from "../../promos/_kit/form-ui";
import type { ClientFormData } from "./client-form";
import { PhotoListField } from "./photo-list-field";

/** Isian klien: nama, logo, website, foto dokumentasi, dan status tayang. */
export function ClientFields({
  client,
  maxPhotos,
}: {
  client: ClientFormData;
  maxPhotos: number;
}) {
  return (
    <>
      <Field label="Nama klien / perusahaan" htmlFor="name" hint="Juga dipakai sebagai teks alternatif logo.">
        <input
          id="name"
          name="name"
          defaultValue={client.name}
          required
          maxLength={120}
          className={inputClass}
        />
      </Field>

      <ImageField
        name="logoUrl"
        label="Logo (opsional — tanpa logo, nama klien yang tampil)"
        folder="corporate"
        defaultValue={client.logoUrl}
      />

      <Field
        label="Website (opsional)"
        htmlFor="websiteUrl"
        hint='Contoh: perusahaan.co.id — "https://" ditambahkan otomatis. Logo menjadi tautan ke website ini.'
      >
        <input
          id="websiteUrl"
          name="websiteUrl"
          defaultValue={client.websiteUrl}
          maxLength={300}
          inputMode="url"
          className={inputClass}
        />
      </Field>

      <PhotoListField
        name="photoUrls"
        label="Foto dokumentasi kegiatan"
        folder="corporate"
        defaultValue={client.photoUrls}
        max={maxPhotos}
      />

      <Checkbox name="isPublished" defaultChecked={client.isPublished}>
        Tampilkan di website
      </Checkbox>
    </>
  );
}