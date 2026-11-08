"use client";

import { useFormStatus } from "react-dom";

/**
 * Komponen form kecil yang dipakai bersama modul admin Gallery, Promos,
 * Gift Card, Membership, Journal, dan Events. Gayanya mengikuti
 * `treatments/treatment-form.tsx`.
 */

export const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";

export const secondaryButtonClass =
  "rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50";

export function SaveButton({ label = "Simpan" }: { label?: string }) {
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

/** Tombol submit kecil (mis. "Simpan caption", "↑", "↓"). */
export function SmallSubmit({
  children,
  title,
  disabled,
}: {
  children: React.ReactNode;
  title?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      title={title}
      aria-label={title}
      disabled={disabled || pending}
      className={secondaryButtonClass}
    >
      {children}
    </button>
  );
}

/** Tombol submit yang meminta konfirmasi browser sebelum menghapus. */
export function ConfirmDeleteButton({
  message,
  children,
  className = "text-sm text-red-700 hover:underline disabled:opacity-50",
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {pending ? "Menghapus…" : children}
    </button>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
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

export function Checkbox({
  name,
  defaultChecked,
  children,
}: {
  name: string;
  defaultChecked: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-700">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 rounded border-neutral-300"
      />
      <span>{children}</span>
    </label>
  );
}

export function ErrorAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {message}
    </p>
  );
}

/** Field SEO dengan indikator panjang karakter (title ~60, description ~160). */
export function SeoFields({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-medium text-neutral-700">SEO</legend>
      <Field
        label="Meta title"
        htmlFor="seoTitle"
        hint="Kosongkan untuk memakai judul. Ideal ±60 karakter."
      >
        <input
          id="seoTitle"
          name="seoTitle"
          defaultValue={title}
          maxLength={120}
          className={inputClass}
        />
      </Field>
      <Field
        label="Meta description"
        htmlFor="seoDescription"
        hint="Ideal ±160 karakter."
      >
        <textarea
          id="seoDescription"
          name="seoDescription"
          defaultValue={description}
          maxLength={320}
          rows={3}
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}
