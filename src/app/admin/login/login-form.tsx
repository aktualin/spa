"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction, type LoginState } from "../actions/auth";
import { PasswordField } from "./password-field";

const initialState: LoginState = { error: null };

const fieldClass =
  "w-full rounded-lg border border-tan bg-white px-3.5 py-2.5 text-sm text-espresso outline-none transition placeholder:text-ink/35 focus:border-cocoa focus:ring-2 focus:ring-cocoa/15";

const labelClass = "block text-xs font-medium text-ink/70";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-lg bg-espresso px-4 py-2.5 text-sm font-medium text-cream transition hover:bg-cocoa focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Processing…" : "Sign in"}
    </button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-7 space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="space-y-1.5">
        <label htmlFor="email" className={labelClass}>
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="name@kamaspa.id"
          required
          autoFocus
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <PasswordField className={fieldClass} />
      </div>

      <label
        htmlFor="remember"
        className="flex cursor-pointer select-none items-center gap-2 text-xs text-ink/70"
      >
        <input
          id="remember"
          name="remember"
          type="checkbox"
          value="on"
          className="h-4 w-4 rounded border-tan accent-espresso"
        />
        Remember me
      </label>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
