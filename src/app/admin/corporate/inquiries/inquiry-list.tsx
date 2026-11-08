"use client";

import { useActionState } from "react";

import {
  deleteInquiryAction,
  updateInquiryAction,
  type ActionState,
} from "../../actions/corporate";
import {
  ConfirmSubmit,
  ErrorMessage,
  SaveButton,
  inputClass,
} from "../../settings/_components/form-ui";

const initialState: ActionState = { error: null };

/** Form ubah status + catatan untuk satu inquiry, plus tombol hapus. */
export function InquiryList({
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
    <div className="mt-3 space-y-3 border-t border-neutral-100 pt-3">
      <form action={formAction} className="space-y-2">
        <input type="hidden" name="id" value={inquiryId} />
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label
              htmlFor={`status-${inquiryId}`}
              className="block text-xs font-medium text-neutral-600"
            >
              Status
            </label>
            <select
              id={`status-${inquiryId}`}
              name="status"
              defaultValue={status}
              className={`${inputClass} w-44`}
            >
              <option value="NEW">Baru</option>
              <option value="CONTACTED">Sudah dihubungi</option>
              <option value="CLOSED">Ditutup</option>
            </select>
          </div>
          <div className="min-w-48 flex-1 space-y-1">
            <label
              htmlFor={`notes-${inquiryId}`}
              className="block text-xs font-medium text-neutral-600"
            >
              Catatan internal
            </label>
            <input
              id={`notes-${inquiryId}`}
              name="notes"
              defaultValue={notes}
              className={inputClass}
            />
          </div>
          <SaveButton label="Simpan status" />
        </div>
        <ErrorMessage error={state.error} />
      </form>

      <form action={deleteInquiryAction}>
        <input type="hidden" name="id" value={inquiryId} />
        <ConfirmSubmit message="Hapus inquiry ini? Tindakan ini tidak bisa dibatalkan.">
          Hapus inquiry
        </ConfirmSubmit>
      </form>
    </div>
  );
}
