"use client";

import { useActionState } from "react";

import { updateOptionPriceAction } from "../../actions/prices";
import { PriceError, SaveButton, initialState, inputClass } from "./price-form-shared";

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
      <PriceError error={state.error} />
    </form>
  );
}