"use client";

import type { ActionState } from "../actions/users";
import { ErrorAlert, Field, inputClass } from "../promos/_kit/form-ui";
import { DeleteButton, type EditUserData } from "./edit-user-parts";

/** Hapus akun permanen (hanya akun nonaktif, dengan konfirmasi email). */
export function DeleteAccountSection({
  user,
  deleteState,
  deleteAction,
}: {
  user: EditUserData;
  deleteState: ActionState;
  deleteAction: (formData: FormData) => void;
}) {
  if (user.isSelf) return null;
  return (
    <form action={deleteAction} className="mt-10 space-y-4 border-t border-red-200 pt-6">
      <input type="hidden" name="id" value={user.id} />
      <h2 className="text-sm font-semibold text-red-800">Hapus akun</h2>
      {user.isActive ? (
        <p className="text-sm text-neutral-600">
          Akun aktif tidak bisa dihapus. Hapus centang <em>Akun aktif</em>{" "}
          di atas lalu simpan; setelah itu akun bisa dihapus permanen.
        </p>
      ) : (
        <>
          <p className="text-sm text-neutral-600">
            Penghapusan permanen dan tidak bisa dibatalkan. Media yang
            pernah diunggah akun ini tetap ada.
          </p>
          <Field
            label={`Ketik ulang email "${user.email}" untuk konfirmasi`}
            htmlFor="confirmEmail"
          >
            <input
              id="confirmEmail"
              name="confirmEmail"
              type="email"
              autoComplete="off"
              required
              className={inputClass}
            />
          </Field>
          <ErrorAlert message={deleteState.error} />
          <DeleteButton />
        </>
      )}
    </form>
  );
}