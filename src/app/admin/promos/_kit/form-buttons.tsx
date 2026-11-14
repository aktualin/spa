"use client";

import { useFormStatus } from "react-dom";

import { secondaryButtonClass } from "./form-fields";

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