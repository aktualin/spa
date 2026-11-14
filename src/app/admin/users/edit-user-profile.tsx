"use client";

import { Field, inputClass } from "../promos/_kit/form-ui";
import type { EditUserData } from "./edit-user-parts";

/** Nama, role, dan status aktif akun (role/aktif terkunci untuk akun sendiri). */
export function ProfileFields({ user }: { user: EditUserData }) {
  return (
    <>
      <Field label="Nama lengkap" htmlFor="name">
        <input
          id="name"
          name="name"
          defaultValue={user.name}
          required
          maxLength={100}
          className={inputClass}
        />
      </Field>

      <Field label="Role" htmlFor="role">
        {/* Select nonaktif tidak ikut terkirim; role akun sendiri dikirim
            lewat input tersembunyi dan tetap dijaga di server. */}
        {user.isSelf ? <input type="hidden" name="role" value={user.role} /> : null}
        <select
          id="role"
          name={user.isSelf ? undefined : "role"}
          defaultValue={user.role}
          disabled={user.isSelf}
          className={inputClass}
        >
          <option value="EDITOR">EDITOR — mengelola modul konten</option>
          <option value="ADMIN">ADMIN — akses penuh, termasuk pengaturan sistem</option>
        </select>
        {user.isSelf ? (
          <p className="text-xs text-neutral-500">
            Anda tidak boleh mengubah role akun Anda sendiri.
          </p>
        ) : null}
      </Field>

      <label className="flex items-start gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={user.isActive}
          disabled={user.isSelf}
          className="mt-0.5 size-4 rounded border-neutral-300"
        />
        <span>
          Akun aktif (boleh login)
          {user.isSelf ? (
            <em className="block text-xs text-neutral-500">
              Anda tidak boleh menonaktifkan akun Anda sendiri.
            </em>
          ) : null}
        </span>
      </label>
    </>
  );
}