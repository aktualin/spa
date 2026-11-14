"use client";

import { useActionState } from "react";

import { updatePackagePriceAction } from "../../actions/prices";
import { PriceError, SaveButton, initialState, inputClass } from "./price-form-shared";

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
      <PriceError error={state.error} />
    </form>
  );
}