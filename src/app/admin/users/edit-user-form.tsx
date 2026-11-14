"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  deleteUserAction,
  resetPasswordAction,
  updateUserAction,
} from "../actions/users";
import { ErrorAlert, SaveButton } from "../promos/_kit/form-ui";
import { DeleteAccountSection } from "./edit-user-delete";
import { initialState, type EditUserData } from "./edit-user-parts";
import { ResetPasswordSection } from "./edit-user-password";
import { ProfileFields } from "./edit-user-profile";

export type { EditUserData } from "./edit-user-parts";

export function EditUserForm({ user }: { user: EditUserData }) {
  const [state, formAction] = useActionState(updateUserAction, initialState);
  const [passwordState, passwordAction] = useActionState(
    resetPasswordAction,
    initialState,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteUserAction,
    initialState,
  );

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/users" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar akun
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        Ubah akun {user.name}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">{user.email}</p>

      <form action={formAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={user.id} />

        <ProfileFields user={user} />

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton label="Simpan perubahan" />
          <Link href="/admin/users" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      <ResetPasswordSection
        user={user}
        passwordState={passwordState}
        passwordAction={passwordAction}
      />

      <DeleteAccountSection user={user} deleteState={deleteState} deleteAction={deleteAction} />
    </div>
  );
}