"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { initialGuestState } from "@/lib/domain/guests";

import { createGuest, updateGuest } from "../actions/guests";
import { ErrorAlert, SaveButton } from "../promos/_kit/form-ui";
import { AttributesEditor, type AttributeRow } from "./guest-form-attributes";
import { GuestFixedFields } from "./guest-form-fields";

export type GuestFormValues = {
  id: string;
  nama: string;
  umur: string;
  jenisKelamin: string;
  attributes: AttributeRow[];
};

/** Form tambah (tanpa `guest`) / edit (guest terisi dari halaman server). */
export function GuestForm({ guest }: { guest?: GuestFormValues }) {
  const isEdit = Boolean(guest?.id);
  const [state, formAction] = useActionState(
    isEdit ? updateGuest : createGuest,
    initialGuestState,
  );
  const [rows, setRows] = useState<AttributeRow[]>(guest?.attributes ?? []);
  const backHref = isEdit ? `/admin/guests/${guest?.id}` : "/admin/guests";

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/guests" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar tamu
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {isEdit ? "Edit tamu" : "Tambah tamu"}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Data pribadi (UU PDP) — gunakan hanya untuk keperluan operasional.
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        {isEdit ? <input type="hidden" name="id" value={guest?.id} /> : null}

        <GuestFixedFields guest={guest} />

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-neutral-700">Atribut Tambahan</p>
          <p className="text-xs text-neutral-500">
            Pasangan key-value bebas (contoh: key “warna_rambut”, value “hitam”).
            Baris dengan key kosong tidak disimpan.
          </p>
          <AttributesEditor rows={rows} onRowsChange={setRows} />
        </div>

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton label={isEdit ? "Simpan perubahan" : "Tambah tamu"} />
          <Link href={backHref} className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
