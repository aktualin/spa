"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  deleteProgramAction,
  saveProgramAction,
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
import { StringListField } from "../_components/string-list-field";

export type ProgramFormData = {
  id: string | null;
  name: string;
  description: string;
  features: string[];
  imageUrl: string;
  isPublished: boolean;
};

const initialState: ActionState = { error: null };

export function CorporateProgramForm({
  program,
  maxFeatures,
}: {
  program: ProgramFormData;
  maxFeatures: number;
}) {
  const [state, formAction] = useActionState(saveProgramAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/corporate#program" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke Corporate Wellness
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {program.id ? `Ubah program ${program.name}` : "Tambah program In-Office"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {program.id ? <input type="hidden" name="id" value={program.id} /> : null}

        <Field label="Nama program" htmlFor="name" hint="Contoh: Essential, Signature, Executive.">
          <input
            id="name"
            name="name"
            defaultValue={program.name}
            required
            maxLength={80}
            className={inputClass}
          />
        </Field>

        <Field label="Deskripsi" htmlFor="description">
          <textarea
            id="description"
            name="description"
            defaultValue={program.description}
            rows={4}
            maxLength={1000}
            className={inputClass}
          />
        </Field>

        <StringListField
          name="features"
          legend="Fitur"
          hint="Satu fitur per baris, tampil sebagai daftar centang. Baris kosong diabaikan."
          itemLabel="fitur"
          placeholder="Contoh: Chair massage"
          defaultValue={program.features}
          max={maxFeatures}
        />

        <ImageField
          name="imageUrl"
          label="Foto program (opsional, tampil di atas kartu)"
          folder="corporate"
          defaultValue={program.imageUrl}
        />

        <Checkbox name="isPublished" defaultChecked={program.isPublished}>
          Tampilkan di website
        </Checkbox>

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/corporate#program" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {program.id ? (
        <form action={deleteProgramAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={program.id} />
          <ConfirmDeleteButton message="Hapus program ini?">Hapus program ini</ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}
