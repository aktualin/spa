"use client";

import { useActionState } from "react";

import type { ActionState } from "../../actions/newsletter";
import { ErrorAlert, Field, inputClass, SaveButton } from "../../promos/_kit/form-ui";

const initialState: ActionState = { error: null };

export function AddSubscriberForm({
  action,
  branches,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  branches: readonly { slug: string; name: string; area: string }[];
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-medium text-neutral-700">Tambah subscriber manual</p>
      <ErrorAlert message={state.error} />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="Email" htmlFor="new-email">
            <input id="new-email" name="email" type="email" required maxLength={254} className={inputClass} />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Cabang (opsional)" htmlFor="new-branch">
            <select id="new-branch" name="branchSlug" defaultValue="" className={inputClass}>
              <option value="">— tidak ditentukan —</option>
              {branches.map((branch) => (
                <option key={branch.slug} value={branch.slug}>
                  {branch.name} | {branch.area}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <SaveButton label="Tambah" />
      </div>
    </form>
  );
}
