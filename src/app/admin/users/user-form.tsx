"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createUserAction } from "../actions/users";
import { ErrorAlert, SaveButton } from "../promos/_kit/form-ui";
import { NewUserFields } from "./user-form-fields";
import { TemporaryPasswordNotice, initialState } from "./user-form-parts";

export { TemporaryPasswordNotice } from "./user-form-parts";

export function NewUserForm() {
  const [state, formAction] = useActionState(createUserAction, initialState);

  if (state.ok && state.temporaryPassword) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-xl font-semibold text-neutral-900">Akun dibuat</h1>
        <TemporaryPasswordNotice
          email={state.email ?? ""}
          password={state.temporaryPassword}
        />
        <Link
          href="/admin/users?saved=1"
          className="mt-6 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Selesai, kembali ke daftar akun
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/users" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar akun
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        Tambah akun admin
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        <NewUserFields />

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton label="Tambah akun" />
          <Link href="/admin/users" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}