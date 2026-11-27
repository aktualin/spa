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
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="notes" className="block text-sm font-medium text-neutral-700">
          Internal note
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={notes}
          rows={4}
          maxLength={2000}
          placeholder="E.g. call outcome, treatment schedule, reason for closing."
          className={inputClass}
        />
        <p className="text-xs text-neutral-500">Only visible to the team in the dashboard.</p>
      </div>
      <ErrorAlert message={state.error} />
      <SaveButton label="Save status" />
    </form>
  );
}