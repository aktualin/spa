"use client";

/**
 * Potongan UI form admin yang dipakai bersama modul Retail, Corporate,
 * Homepage, Our Story, Menu, Kontak & Umum, dan SEO. Gayanya mengikuti
 * `treatments/treatment-form.tsx`.
 *
 * SaveButton/Field/Checkbox identik dengan kit promos — dipakai ulang dari
 * sana supaya tidak ada dua salinan.
 */

import { ErrorAlert } from "../../promos/_kit/form-ui";

export { inputClass } from "./styles";
export { SaveButton, Field, Checkbox } from "../../promos/_kit/form-ui";

export function ErrorMessage({ error }: { error: string | null }) {
  return <ErrorAlert message={error} />;
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