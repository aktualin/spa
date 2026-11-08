"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/lib/domain/password-policy";

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

  if (state.ok && state.temporaryPassword) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-xl font-semibold text-neutral-900">Akun dibuat</h1>
        <TemporaryPasswordNotice
          email={state.email ?? ""}
          password={state.temporaryPassword}
        />
        <Link
          href="/admin/users?saved=1"
          className="mt-6 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Selesai, kembali ke daftar akun
        </Link>
      </div>
    );
  }

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

/**
 * Kata sandi sementara yang dibuat sistem. Hanya ada di memori browser selama
 * halaman ini terbuka; setelah pindah halaman tidak bisa ditampilkan lagi.
 */
export function TemporaryPasswordNotice({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return (
    <div
      role="status"
      className="mt-4 space-y-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <p>
        Kata sandi sementara untuk <strong>{email}</strong>:
      </p>
      <p className="select-all rounded bg-white px-3 py-2 font-mono text-base tracking-wide text-neutral-900">
        {password}
      </p>
      <p>
        Salin dan sampaikan lewat jalur terpisah (misalnya pesan langsung).
        Kata sandi ini <strong>hanya ditampilkan sekali</strong> dan tidak
        disimpan dalam bentuk yang bisa dibaca. Pemilik akun wajib menggantinya
        saat login pertama.
      </p>
    </div>
  );
}
