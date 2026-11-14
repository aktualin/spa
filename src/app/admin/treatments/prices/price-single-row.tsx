"use client";

import { useActionState } from "react";

import {
  updateMembershipPriceAction,
  updateRetailPriceAction,
} from "../../actions/prices";
import { PriceError, SaveButton, initialState, inputClass } from "./price-form-shared";

const SINGLE_PRICE_ACTIONS = {
  membership: updateMembershipPriceAction,
  retail: updateRetailPriceAction,
};

/**
 * Baris harga tunggal tanpa durasi (tier membership, produk retail).
 * Harga boleh dikosongkan; arti kosong dijelaskan lewat `emptyHint`.
 */
export function SinglePriceRow({
  kind,
  id,
  name,
  priceIdr,
  emptyHint,
}: {
  kind: keyof typeof SINGLE_PRICE_ACTIONS;
  id: string;
  name: string;
  priceIdr: string;
  emptyHint: string;
}) {
  const [state, formAction] = useActionState(
    SINGLE_PRICE_ACTIONS[kind],
    initialState,
  );

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-40 flex-1 text-sm font-medium text-neutral-800">
          {name}
        </span>
        <label className="text-xs text-neutral-600">
          <span className="sr-only">Harga {name}</span>
          <input
            aria-label={`Harga ${name}`}
            name="priceIdr"
            defaultValue={priceIdr}
            inputMode="numeric"
            placeholder="Kosong"
            className={`${inputClass} w-36`}
          />
        </label>
        <SaveButton />
      </div>
      <p className="text-xs text-neutral-500">{emptyHint}</p>
      <PriceError error={state.error} />
    </form>
  );
}