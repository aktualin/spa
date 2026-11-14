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

      <Field label="Nama lengkap" htmlFor="name">
        <input id="name" name="name" required maxLength={100} className={inputClass} />
      </Field>

      <Field label="Role" htmlFor="role">
        <select id="role" name="role" className={inputClass} defaultValue="EDITOR">
          <option value="EDITOR">EDITOR — mengelola modul konten</option>
          <option value="ADMIN">ADMIN — akses penuh, termasuk pengaturan sistem</option>
        </select>
      </Field>

      <Field
        label="Kata sandi awal (opsional)"
        htmlFor="password"
        hint={`Kosongkan agar sistem membuatkan kata sandi acak yang ditampilkan sekali. Bila diisi: minimal ${MIN_PASSWORD_LENGTH} karakter. Pemilik akun wajib menggantinya saat login pertama.`}
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