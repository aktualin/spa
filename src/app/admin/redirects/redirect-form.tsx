"use client";

import { useActionState } from "react";

import { saveRedirectAction, type ActionState } from "../actions/redirects";
import {
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";

const initialState: ActionState = { error: null };

export function RedirectForm() {
  const [state, formAction] = useActionState(saveRedirectAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4"
    >
      <h2 className="text-sm font-semibold text-neutral-900">Tambah redirect manual</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="URL asal" htmlFor="fromPath" hint="Contoh: /promo-lebaran-2025">
          <input
            id="fromPath"
            name="fromPath"
            required
            placeholder="/alamat-lama"
            autoComplete="off"
            spellCheck={false}
            className={`${inputClass} font-mono`}
          />
        </Field>
        <Field
          label="URL tujuan"
          htmlFor="toPath"
          hint="Path internal (/promos) atau alamat https:// lengkap."
        >
          <input
            id="toPath"
            name="toPath"
            required
            placeholder="/promos"
            autoComplete="off"
            spellCheck={false}
            className={`${inputClass} font-mono`}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <Field label="Jenis" htmlFor="statusCode">
          <select id="statusCode" name="statusCode" defaultValue="301" className={inputClass}>
            <option value="301">301 — permanen</option>
            <option value="302">302 — sementara</option>
          </select>
        </Field>
        <Field label="Catatan (opsional)" htmlFor="note" hint="Alasan redirect, untuk pengingat tim.">
          <input id="note" name="note" maxLength={200} className={inputClass} />
        </Field>
      </div>

      <ErrorMessage error={state.error} />

      <SaveButton label="Tambah redirect" />
    </form>
  );
}
