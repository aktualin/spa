"use client";

import { useActionState } from "react";

import { updateReservationAction } from "../actions/reservations";
import { ErrorAlert, SaveButton, inputClass } from "../promos/_kit/form-ui";

const initialState = { error: null };

/** Form ubah status + catatan internal untuk satu permintaan reservasi. */
export function ReservationStatusForm({
  reservationId,
  status,
  notes,
}: {
  reservationId: string;
  status: string;
  notes: string;
}) {
  const [state, formAction] = useActionState(updateReservationAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={reservationId} />
      <div className="space-y-1">
        <label htmlFor="status" className="block text-sm font-medium text-neutral-700">
          Status
        </label>
        <select id="status" name="status" defaultValue={status} className={`${inputClass} sm:w-60`}>
          <option value="NEW">Baru</option>
          <option value="CONTACTED">Sudah dihubungi</option>
          <option value="CLOSED">Ditutup</option>
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="notes" className="block text-sm font-medium text-neutral-700">
          Catatan internal
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={notes}
          rows={4}
          maxLength={2000}
          placeholder="Mis. hasil telepon, jadwal treatment, alasan ditutup."
          className={inputClass}
        />
        <p className="text-xs text-neutral-500">Hanya terlihat oleh tim di dashboard.</p>
      </div>
      <ErrorAlert message={state.error} />
      <SaveButton label="Simpan status" />
    </form>
  );
}