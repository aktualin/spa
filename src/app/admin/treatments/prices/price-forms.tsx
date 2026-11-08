"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  updateOptionPriceAction,
  updatePackagePriceAction,
  type ActionState,
} from "../../actions/prices";

const initialState: ActionState = { error: null };

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";

function SaveButton({ label = "Simpan" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
    >
      {pending ? "…" : label}
    </button>
  );
}

/**
 * Satu baris = satu pilihan durasi treatment. Harga & durasi baris ini
 * disimpan sendiri-sendiri (tombol simpan per baris).
 */
export function OptionPriceRow({
  optionId,
  label,
  durationMin,
  priceIdr,
}: {
  optionId: string;
  label: string;
  durationMin: string;
  priceIdr: string;
}) {
  const [state, formAction] = useActionState(updateOptionPriceAction, initialState);

  return (
    <form action={formAction} className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-40 flex-1 text-sm text-neutral-800">{label}</span>
        <label className="text-xs text-neutral-600">
          <span className="sr-only">Durasi menit {label}</span>
          <input
            aria-label={`Durasi ${label}`}
            name={`options[${optionId}][durationMin]`}
            defaultValue={durationMin}
            inputMode="numeric"
            className={`${inputClass} w-24`}
          />
        </label>
        <label className="text-xs text-neutral-600">
          <span className="sr-only">Harga {label}</span>
          <input
            aria-label={`Harga ${label}`}
            name={`options[${optionId}][priceIdr]`}
            defaultValue={priceIdr}
            inputMode="numeric"
            className={`${inputClass} w-36`}
          />
        </label>
        <SaveButton />
      </div>
      {state.error ? (
        <p role="alert" className="text-xs text-red-700">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

/** Baris harga package (durasi opsional). */
export function PackagePriceRow({
  packageId,
  name,
  durationMin,
  priceIdr,
}: {
  packageId: string;
  name: string;
  durationMin: string;
  priceIdr: string;
}) {
  const [state, formAction] = useActionState(
    updatePackagePriceAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="id" value={packageId} />
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-40 flex-1 text-sm font-medium text-neutral-800">
          {name}
        </span>
        <label className="text-xs text-neutral-600">
          <span className="sr-only">Durasi menit {name}</span>
          <input
            aria-label={`Durasi ${name}`}
            name="durationMin"
            defaultValue={durationMin}
            inputMode="numeric"
            className={`${inputClass} w-24`}
          />
        </label>
        <label className="text-xs text-neutral-600">
          <span className="sr-only">Harga {name}</span>
          <input
            aria-label={`Harga ${name}`}
            name="priceIdr"
            defaultValue={priceIdr}
            inputMode="numeric"
            className={`${inputClass} w-36`}
          />
        </label>
        <SaveButton />
      </div>
      {state.error ? (
        <p role="alert" className="text-xs text-red-700">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
