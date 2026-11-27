"use client";

import { useActionState } from "react";

import {
  changeOwnPasswordAction,
  type ChangePasswordState,
} from "../../actions/account";
import {
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../../settings/_components/form-ui";

const initialState: ChangePasswordState = { error: null };

export function ChangePasswordForm({ minLength }: { minLength: number }) {
  const [state, formAction] = useActionState(
    changeOwnPasswordAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5"
    >
      <Field label="Current password" htmlFor="currentPassword">
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>

      <Field
        label="New password"
        htmlFor="newPassword"
        hint={`At least ${minLength} characters. Use a phrase that is easy to remember but hard to guess.`}
      >
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={minLength}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Confirm new password" htmlFor="confirmPassword">
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={minLength}
          required
          className={inputClass}
        />
      </Field>

      <ErrorMessage error={state.error} />

      <SaveButton label="Save password" />
    </form>
  );
}
