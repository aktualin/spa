"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  deleteClientAction,
  saveClientAction,
  type ActionState,
} from "../../actions/corporate-items";
import { ImageField } from "../../image-field";
import {
  Checkbox,
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  inputClass,
} from "../../promos/_kit/form-ui";
import { PhotoListField } from "./photo-list-field";

export type ClientFormData = {
  id: string | null;
  name: string;
  logoUrl: string;
  websiteUrl: string;
  photoUrls: string[];
  isPublished: boolean;
};

const initialState: ActionState = { error: null };

export function CorporateClientForm({
  client,
  maxPhotos,
}: {
  client: ClientFormData;
  maxPhotos: number;
}) {
  const [state, formAction] = useActionState(saveClientAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/corporate#klien" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke Corporate Wellness
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {client.id ? `Ubah klien ${client.name}` : "Tambah klien corporate"}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Logo tampil di bagian &quot;Past Collaborations&quot; halaman /corporate, foto
        dokumentasi tampil di bawahnya.
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        {client.id ? <input type="hidden" name="id" value={client.id} /> : null}

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

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/corporate#klien" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {client.id ? (
        <form action={deleteClientAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={client.id} />
          <ConfirmDeleteButton message="Hapus klien ini beserta daftar fotonya? Berkas foto tetap ada di Media Library.">
            Hapus klien ini
          </ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}
