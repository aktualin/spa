"use client";

import { useActionState } from "react";

import type { PageCopyGroup } from "@/lib/domain/page-copy";

import {
  savePageCopyAction,
  type PageCopyFormState,
} from "../actions/page-copy";
import {
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";

const initialState: PageCopyFormState = { error: null };

export function PageCopyForm({
  groups,
  values,
}: {
  groups: readonly PageCopyGroup[];
  values: Record<string, string>;
}) {
  const [state, formAction] = useActionState(savePageCopyAction, initialState);
  const current = state.values ?? values;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-neutral-900">Teks Halaman</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Semua teks di bawah ini tampil di halaman publik. Kosongkan sebuah field
        untuk menyembunyikan elemen terkait; halaman akan memakai empty state.
      </p>

      <form action={formAction} className="mt-6 space-y-10" key={state.attempt ?? 0}>
        {groups.map((group) => (
          <fieldset key={group.group} className="space-y-5">
            <legend className="text-base font-semibold text-neutral-900">
              {group.label}
            </legend>
            {group.description ? (
              <p className="-mt-3 text-sm text-neutral-500">{group.description}</p>
            ) : null}

            {group.fields.map((field) => {
              const id = field.key.replaceAll(".", "-");
              const value = current[field.key] ?? "";
              const hint = field.hint ?? `Maks. ${field.maxLength ?? 5000} karakter.`;
              return (
                <Field key={field.key} label={field.label} htmlFor={id} hint={hint}>
                  {field.type === "text" || field.type === "url" ? (
                    <input
                      id={id}
                      name={field.key}
                      defaultValue={value}
                      type={field.type === "url" ? "text" : "text"}
                      maxLength={field.maxLength}
                      className={inputClass}
                    />
                  ) : (
                    <textarea
                      id={id}
                      name={field.key}
                      defaultValue={value}
                      rows={field.type === "richHtml" ? 6 : 3}
                      maxLength={field.maxLength}
                      className={inputClass}
                    />
                  )}
                </Field>
              );
            })}
          </fieldset>
        ))}

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
        </div>
      </form>
    </div>
  );
}
