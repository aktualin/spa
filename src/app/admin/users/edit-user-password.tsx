"use client";

import Link from "next/link";

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/domain/password-policy";

import type { ActionState } from "../actions/users";
import { ErrorAlert, Field, SaveButton, inputClass } from "../promos/_kit/form-ui";
import type { EditUserData } from "./edit-user-parts";
import { TemporaryPasswordNotice } from "./user-form";

/** Reset kata sandi akun lain; akun sendiri diarahkan ke menu Ganti kata sandi. */
export function ResetPasswordSection({
  user,
  passwordState,
  passwordAction,
}: {
  user: EditUserData;
  passwordState: ActionState;
  passwordAction: (formData: FormData) => void;
}) {
  if (user.isSelf) {
    return (
      <p className="mt-10 border-t border-neutral-200 pt-6 text-sm text-neutral-600">
        Untuk mengganti kata sandi akun Anda sendiri, gunakan menu{" "}
        <Link href="/admin/account/password" className="underline">
          Ganti kata sandi
        </Link>
        .
      </p>
    );
  }

  if (passwordState.ok && passwordState.temporaryPassword) {
    return (
      <section className="mt-10 border-t border-neutral-200 pt-6">
        <h2 className="text-sm font-semibold text-neutral-800">
          Kata sandi direset
        </h2>
        <TemporaryPasswordNotice
          email={passwordState.email ?? user.email}
          password={passwordState.temporaryPassword}
        />
      </section>
    );
  }

  return (
    <form action={passwordAction} className="mt-10 space-y-5 border-t border-neutral-200 pt-6">
      <input type="hidden" name="id" value={user.id} />
      <h2 className="text-sm font-semibold text-neutral-800">Reset kata sandi</h2>

      <Field
        label="Kata sandi baru (opsional)"
        htmlFor="newPassword"
        hint={`Kosongkan agar sistem membuatkan kata sandi acak yang ditampilkan sekali. Bila diisi: minimal ${MIN_PASSWORD_LENGTH} karakter. Akun ini akan keluar dari semua perangkat dan wajib mengganti kata sandi saat login berikutnya.`}
      >
        <input
          id="newPassword"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          maxLength={MAX_PASSWORD_LENGTH}
          className={inputClass}
        />
      </Field>

      <ErrorAlert message={passwordState.error} />

      <SaveButton label="Reset kata sandi" />
    </form>
  );
}