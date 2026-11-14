"use client";

import { Field, inputClass } from "../promos/_kit/form-ui";
import { JOURNAL_STATUSES } from "./journal-status";
import { scheduleHint, statusLabel, type JournalFormData } from "./journal-form.types";

/** Status terbit + tanggal publikasi (WIB). */
export function StatusFields({
  status,
  setStatus,
  publishedAt,
  setPublishedAt,
}: {
  status: JournalFormData["status"];
  setStatus: (value: JournalFormData["status"]) => void;
  publishedAt: string;
  setPublishedAt: (value: string) => void;
}) {
  return (
    <>
      <Field label="Status" htmlFor="status">
        <select
          id="status"
          name="status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as JournalFormData["status"])
          }
          className={inputClass}
        >
          {JOURNAL_STATUSES.map((value) => (
            <option key={value} value={value}>
              {statusLabel[value]}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Tanggal publikasi (WIB)"
        htmlFor="publishedAt"
        hint={scheduleHint[status]}
      >
        <input
          id="publishedAt"
          name="publishedAt"
          type="datetime-local"
          value={publishedAt}
          onChange={(event) => setPublishedAt(event.target.value)}
          required={status === "SCHEDULED"}
          className={inputClass}
        />
      </Field>
    </>
  );
}