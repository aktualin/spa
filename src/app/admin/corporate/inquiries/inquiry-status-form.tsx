"use client";

import { useActionState } from "react";

import { updateInquiryAction, type ActionState } from "../../actions/corporate";
import { ErrorAlert, SaveButton, inputClass } from "../../promos/_kit/form-ui";

const initialState: ActionState = { error: null };

/** Form ubah status + catatan internal untuk satu inquiry. */
export function InquiryStatusForm({
  inquiryId,
  status,
  notes,
}: {
  inquiryId: string;
  status: string;
  notes: string;
}) {
  const [state, formAction] = useActionState(updateInquiryAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={inquiryId} />
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
          Internal notes
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={notes}
          rows={4}
          maxLength={2000}
          placeholder="E.g. call outcome, presentation schedule, reason for closing."
          className={inputClass}
        />
        <p className="text-xs text-neutral-500">Visible only to the team in the dashboard.</p>
      </div>
      <ErrorAlert message={state.error} />
      <SaveButton label="Save status" />
    </form>
  );
}
