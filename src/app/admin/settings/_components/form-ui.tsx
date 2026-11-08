"use client";

import { useFormStatus } from "react-dom";

/**
 * Potongan UI form admin yang dipakai bersama modul Retail, Corporate,
 * Homepage, Our Story, Menu, Kontak & Umum, dan SEO. Gayanya mengikuti
 * `treatments/treatment-form.tsx`.
 */

export { inputClass } from "./styles";

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

export function ErrorMessage({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
      {error}
    </p>
  );
}

/** Banner `?saved=1` / `?deleted=1` di halaman list. */
export function StatusBanner({
  saved,
  deleted,
  savedText = "Perubahan tersimpan.",
  deletedText = "Data dihapus.",
}: {
  saved?: string;
  deleted?: string;
  savedText?: string;
  deletedText?: string;
}) {
  return (
    <>
      {saved ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          {savedText}
        </p>
      ) : null}
      {deleted ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          {deletedText}
        </p>
      ) : null}
    </>
  );
}

/** Tombol hapus dengan konfirmasi browser sebelum form dikirim. */
export function ConfirmSubmit({
  message,
  children,
  className = "text-sm text-red-700 hover:underline",
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "muted" | "warn";
}) {
  const className =
    tone === "muted"
      ? "bg-neutral-100 text-neutral-600"
      : tone === "warn"
        ? "bg-amber-100 text-amber-800"
        : "bg-neutral-900 text-white";
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}
