"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  resetPasswordAction,
  updateUserAction,
  type ActionState,
} from "../actions/users";

const initialState: ActionState = { error: null };

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";

export type EditUserData = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
  isActive: boolean;
  isSelf: boolean;
};

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

export function EditUserForm({ user }: { user: EditUserData }) {
  const [state, formAction] = useActionState(updateUserAction, initialState);
  const [passwordState, passwordAction] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/users" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar akun
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        Ubah akun {user.name}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">{user.email}</p>

      <form action={formAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={user.id} />

        <Field label="Nama lengkap" htmlFor="name">
          <input
            id="name"
            name="name"
            defaultValue={user.name}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Role" htmlFor="role">
          <select
            id="role"
            name="role"
            defaultValue={user.role}
            className={inputClass}
          >
            <option value="EDITOR">EDITOR — manages konten</option>
            <option value="ADMIN">ADMIN — akses penuh</option>
          </select>
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

        {state.error ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {state.error}
          </p>
        ) : null}

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton label="Simpan perubahan" />
          <Link href="/admin/users" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      <form action={passwordAction} className="mt-10 space-y-5 border-t border-neutral-200 pt-6">
        <input type="hidden" name="id" value={user.id} />
        <h2 className="text-sm font-semibold text-neutral-800">Reset kata sandi</h2>

        <Field
          label="Kata sandi baru"
          htmlFor="newPassword"
          hint="Minimal 12 karakter."
        >
          <input
            id="newPassword"
            name="password"
            type="password"
            required
            minLength={12}
            className={inputClass}
          />
        </Field>

        {passwordState.error ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {passwordState.error}
          </p>
        ) : null}

        <SaveButton label="Reset kata sandi" />
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
