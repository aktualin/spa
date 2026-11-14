"use client";

import Link from "next/link";
import { useActionState } from "react";

import { deleteBranchAction, saveBranchAction } from "../actions/branches";
import {
  Checkbox,
  ConfirmSubmit,
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";
import { ContactFields } from "./branch-form-contact";
import { IdentityFields } from "./branch-form-identity";
import { MapsFields } from "./branch-form-maps";
import { initialState, type BranchFormData } from "./branch-form.types";

export type { BranchFormData } from "./branch-form.types";

export function BranchForm({ branch }: { branch: BranchFormData }) {
  const [state, formAction] = useActionState(saveBranchAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/branches" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {branch.id ? `Ubah ${branch.name}` : "Tambah cabang"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {branch.id ? <input type="hidden" name="id" value={branch.id} /> : null}

        <IdentityFields branch={branch} />
        <ContactFields branch={branch} />
        <MapsFields branch={branch} />

        <Field
          label="Urutan tampil"
          htmlFor="sortOrder"
          hint="Makin kecil makin atas. Kosongkan untuk meletakkan cabang baru di akhir; urutan juga bisa diatur dengan tombol ↑/↓ di daftar."
        >
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            step={1}
            defaultValue={branch.sortOrder}
            className={`${inputClass} w-28`}
          />
        </Field>

        <Checkbox name="isPublished" defaultChecked={branch.isPublished}>
          Tampilkan di website
        </Checkbox>

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/branches" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {branch.id ? (
        <form action={deleteBranchAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={branch.id} />
          <ConfirmSubmit message={`Hapus cabang "${branch.name}"?`}>
            Hapus cabang ini
          </ConfirmSubmit>
        </form>
      ) : null}
    </div>
  );
}