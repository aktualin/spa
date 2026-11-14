"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  deleteClientAction,
  saveClientAction,
  type ActionState,
} from "../../actions/corporate-items";
import {
  ConfirmDeleteButton,
  ErrorAlert,
  SaveButton,
} from "../../promos/_kit/form-ui";
import { ClientFields } from "./client-form-fields";

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

        <ClientFields client={client} maxPhotos={maxPhotos} />

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