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
        To change the password of your own account, use the{" "}
        <Link href="/admin/account/password" className="underline">
          Change password
        </Link>
         menu
        .
      </p>
    );
  }

  if (passwordState.ok && passwordState.temporaryPassword) {
    return (
      <section className="mt-10 border-t border-neutral-200 pt-6">
        <h2 className="text-sm font-semibold text-neutral-800">
          Password reset
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
      <h2 className="text-sm font-semibold text-neutral-800">Reset password</h2>

      <Field
        label="New password (optional)"
        htmlFor="newPassword"
        hint={`Leave empty so the system generates a random password that is shown once. If filled in: at least ${MIN_PASSWORD_LENGTH} characters. This account will be logged out on all devices and must change its password at the next login.`}
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

      <SaveButton label="Reset password" />
    </form>
  );
}