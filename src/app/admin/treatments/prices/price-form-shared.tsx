"use client";

import { useFormStatus } from "react-dom";

import type { ActionState } from "../../actions/prices";

export const initialState: ActionState = { error: null };

export const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";

export function SaveButton({ label = "Simpan" }: { label?: string }) {
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

export function PriceError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="text-xs text-red-700">
      {error}
    </p>
  );
}