"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  deleteProgramAction,
  saveProgramAction,
  type ActionState,
} from "../../actions/corporate-items";
import {
  ConfirmDeleteButton,
  ErrorAlert,
  SaveButton,
} from "../../promos/_kit/form-ui";
import { ProgramFields } from "./program-form-fields";

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

        <ProgramFields program={program} maxFeatures={maxFeatures} />

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