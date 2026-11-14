"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { ActionState } from "../../actions/homepage-content";
import { ConfirmDeleteButton, ErrorAlert, SaveButton } from "../../promos/_kit/form-ui";

export const initialState: ActionState = { error: null };

/** Kerangka form konten homepage: judul, form, tombol simpan, dan hapus. */
export function Shell({
  listPath,
  backLabel,
  heading,
  intro,
  id,
  formAction,
  error,
  children,
  deleteAction,
  deleteMessage,
  deleteLabel,
}: {
  listPath: string;
  backLabel: string;
  heading: string;
  intro: string;
  id: string | null;
  formAction: (formData: FormData) => void;
  error: string | null;
  children: ReactNode;
  deleteAction: (formData: FormData) => void | Promise<void>;
  deleteMessage: string;
  deleteLabel: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href={listPath} className="text-sm text-neutral-600 hover:underline">
        ← {backLabel}
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-neutral-900">{heading}</h1>
      <p className="mt-1 text-sm text-neutral-600">{intro}</p>

      <form action={formAction} className="mt-6 space-y-5">
        {id ? <input type="hidden" name="id" value={id} /> : null}
        {children}
        <ErrorAlert message={error} />
        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href={listPath} className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {id ? (
        <form action={deleteAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={id} />
          <ConfirmDeleteButton message={deleteMessage}>{deleteLabel}</ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}