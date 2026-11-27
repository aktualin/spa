"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  recordHandoverBackupAction,
  triggerGithubBackupAction,
  type BackupActionState,
} from "../actions/backup";
import { ErrorMessage, Field, SaveButton, inputClass } from "../settings/_components/form-ui";

const initialState: BackupActionState = { error: null };

function PendingButton({ label, pendingLabel, disabled }: { label: string; pendingLabel: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/** Tombol memicu workflow GitHub Actions (pg_dump terenkripsi). */
export function GithubBackupForm({ enabled, reason }: { enabled: boolean; reason: string | null }) {
  const [state, formAction] = useActionState(triggerGithubBackupAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <PendingButton
        label="Run pg_dump backup now"
        pendingLabel="Contacting GitHub…"
        disabled={!enabled}
      />
      {!enabled && reason ? <p className="text-xs text-neutral-500">{reason}</p> : null}
      <ErrorMessage error={state.error} />
      {state.message ? (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

/** Form pencatatan backup lengkap saat serah terima. */
export function HandoverForm() {
  const [state, formAction] = useActionState(recordHandoverBackupAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Storage location"
        htmlFor="location"
        hint="Example: client Google Drive › Handover › kamaspa-20270105-100000.sql.gz.gpg. Do not write passwords or connection strings."
      >
        <input id="location" name="location" required maxLength={200} className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <Field
          label="Checksum SHA-256"
          htmlFor="sha256"
          hint="Paste the SHA-256 line printed by scripts/backup-db.sh (or the output of shasum -a 256)."
        >
          <input
            id="sha256"
            name="sha256"
            required
            autoComplete="off"
            spellCheck={false}
            className={`${inputClass} font-mono`}
          />
        </Field>
        <Field label="Size (optional)" htmlFor="sizeBytes" hint="E.g. 1.2 MB">
          <input id="sizeBytes" name="sizeBytes" className={inputClass} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input type="checkbox" name="restoreTested" className="size-4 rounded border-neutral-300" />
        <span>Restore test to a separate database has succeeded</span>
      </label>
      <Field label="Note (optional)" htmlFor="note" hint="E.g. who it was handed to, where the passphrase is stored (without writing the passphrase itself).">
        <textarea id="note" name="note" rows={2} maxLength={500} className={inputClass} />
      </Field>
      <ErrorMessage error={state.error} />
      <SaveButton label="Record handover backup" />
    </form>
  );
}
