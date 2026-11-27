"use client";

import { Field, inputClass } from "../promos/_kit/form-ui";
import type { EditUserData } from "./edit-user-parts";

/** Nama, role, dan status aktif akun (role/aktif terkunci untuk akun sendiri). */
export function ProfileFields({ user }: { user: EditUserData }) {
  return (
    <>
      <Field label="Full name" htmlFor="name">
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
          <option value="EDITOR">EDITOR — manages content modules</option>
          <option value="ADMIN">ADMIN — full access, including system settings</option>
        </select>
        {user.isSelf ? (
          <p className="text-xs text-neutral-500">
            You are not allowed to change the role of your own account.
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
          Active account (allowed to log in)
          {user.isSelf ? (
            <em className="block text-xs text-neutral-500">
              You are not allowed to deactivate your own account.
            </em>
          ) : null}
        </span>
      </label>
    </>
  );
}