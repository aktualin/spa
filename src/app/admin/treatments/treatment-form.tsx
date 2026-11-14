"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { deleteTreatmentAction, saveTreatmentAction } from "../actions/treatments";
import { ErrorAlert, SaveButton } from "../promos/_kit/form-ui";
import { TreatmentContentFields } from "./treatment-content-fields";
import {
  initialState,
  type TreatmentCategoryOption,
  type TreatmentFormData,
} from "./treatment-form.types";
import { IdentityFields } from "./treatment-identity";
import { MetaFields } from "./treatment-meta";
import { OptionsFieldset } from "./treatment-options";

export type { TreatmentCategoryOption, TreatmentFormData } from "./treatment-form.types";

export function TreatmentForm({
  treatment,
  categories,
}: {
  treatment: TreatmentFormData;
  categories: TreatmentCategoryOption[];
}) {
  const [state, formAction] = useActionState(saveTreatmentAction, initialState);
  const [categoryId, setCategoryId] = useState(treatment.categoryId);
  const isAddon = categories.find((c) => c.id === categoryId)?.kind === "ADDON";
  const backHref = isAddon ? "/admin/treatments/addons" : "/admin/treatments";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={backHref} className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {treatment.id
          ? `Ubah ${treatment.name}`
          : isAddon
            ? "Tambah add-on"
            : "Tambah treatment"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {treatment.id ? (
          <input type="hidden" name="id" value={treatment.id} />
        ) : null}

        <IdentityFields
          treatment={treatment}
          categories={categories}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          isAddon={isAddon}
        />

        <TreatmentContentFields treatment={treatment} isAddon={isAddon} />

        <OptionsFieldset initial={treatment.options} />

        <MetaFields treatment={treatment} />

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link
            href="/admin/treatments"
            className="text-sm text-neutral-600 hover:underline"
          >
            Batal
          </Link>
        </div>
      </form>

      {treatment.id ? (
        <form
          action={deleteTreatmentAction}
          className="mt-8 border-t border-neutral-200 pt-4"
        >
          <input type="hidden" name="id" value={treatment.id} />
          <button
            type="submit"
            className="text-sm text-red-700 hover:underline"
          >
            Hapus treatment ini
          </button>
        </form>
      ) : null}
    </div>
  );
}