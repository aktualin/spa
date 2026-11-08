"use client";

import Link from "next/link";
import { useActionState } from "react";

import { deleteStepAction, saveStepAction, type ActionState } from "../../actions/corporate-items";
import {
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  inputClass,
} from "../../promos/_kit/form-ui";

export type StepFormData = { id: string | null; title: string; body: string };

const initialState: ActionState = { error: null };

export function CorporateStepForm({ step }: { step: StepFormData }) {
  const [state, formAction] = useActionState(saveStepAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/corporate#langkah" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke Corporate Wellness
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {step.id ? "Ubah langkah kolaborasi" : "Tambah langkah kolaborasi"}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Nomor &quot;Step&quot; dan jumlah langkah di judul (&quot;A Simple 4-Step …&quot;)
        dihitung otomatis dari urutan.
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        {step.id ? <input type="hidden" name="id" value={step.id} /> : null}

        <Field label="Judul" htmlFor="title" hint="Contoh: Discovery & Consultation.">
          <input
            id="title"
            name="title"
            defaultValue={step.title}
            required
            maxLength={120}
            className={inputClass}
          />
        </Field>

        <Field label="Keterangan" htmlFor="body" hint="Contoh: Understand your goals.">
          <textarea
            id="body"
            name="body"
            defaultValue={step.body}
            rows={3}
            maxLength={500}
            className={inputClass}
          />
        </Field>

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/corporate#langkah" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {step.id ? (
        <form action={deleteStepAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={step.id} />
          <ConfirmDeleteButton message="Hapus langkah ini?">Hapus langkah ini</ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}
