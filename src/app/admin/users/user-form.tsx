"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createUserAction,
  type ActionState,
} from "../actions/users";

const initialState: ActionState = { error: null };

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
    >
      {pending ? "Menyimpan…" : label}
    </button>
  );
}

export function NewUserForm() {
  const [state, formAction] = useActionState(createUserAction, initialState);

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/users" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar akun
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        Tambah akun admin
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputClass}
          />
        </Field>

        <Field label="Nama lengkap" htmlFor="name">
          <input id="name" name="name" required className={inputClass} />
        </Field>

        <Field label="Role" htmlFor="role">
          <select id="role" name="role" className={inputClass} defaultValue="EDITOR">
            <option value="EDITOR">EDITOR — manages konten</option>
            <option value="ADMIN">ADMIN — akses penuh</option>
          </select>
        </Field>

        <Field
          label="Kata sandi awal"
          htmlFor="password"
          hint="Minimal 12 karakter. Beri tahu pengguna secara terpisah."
        >
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={12}
            className={inputClass}
          />
        </Field>

        {state.error ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {state.error}
          </p>
        ) : null}

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton label="Tambah akun" />
          <Link href="/admin/users" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-neutral-700"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}
