"use client";

import { deleteGuest } from "../actions/guests";
import { ConfirmDeleteButton } from "../promos/_kit/form-ui";

/** Tombol Hapus per baris (list/detail): konfirmasi browser + Server Action. */
export function GuestDeleteButton({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return (
    <form action={deleteGuest} className="inline">
      <input type="hidden" name="id" value={id} />
      <ConfirmDeleteButton
        message="Hapus tamu ini beserta seluruh atributnya? Tindakan ini tidak bisa dibatalkan."
        className={className}
      >
        Hapus
      </ConfirmDeleteButton>
    </form>
  );
}
