"use client";

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/domain/password-policy";

import { Field, inputClass } from "../promos/_kit/form-ui";

/** Email, nama, role, dan kata sandi awal akun admin baru. */
export function NewUserFields() {
  return (
    <>
      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="off"
          className={inputClass}
        />
      </Field>

      <Field label="Full name" htmlFor="name">
        <input id="name" name="name" required maxLength={100} className={inputClass} />
      </Field>

      <Field label="Role" htmlFor="role">
        <select id="role" name="role" className={inputClass} defaultValue="EDITOR">
          <option value="EDITOR">EDITOR — manages content modules</option>
          <option value="ADMIN">ADMIN — full access, including system settings</option>
        </select>
      </Field>

      <Field
        label="Initial password (optional)"
        htmlFor="password"
        hint={`Leave empty so the system generates a random password that is shown once. If filled in: at least ${MIN_PASSWORD_LENGTH} characters. The account owner must change it at their first login.`}
      >
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          maxLength={MAX_PASSWORD_LENGTH}
          className={inputClass}
        />
      </Field>
    </>
  );
}