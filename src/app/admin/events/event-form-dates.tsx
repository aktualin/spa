"use client";

import { useState } from "react";

import { Field, inputClass } from "../promos/_kit/form-ui";
import type { EventFormData } from "./event-form.types";

/** Tanggal mulai & selesai (WIB); selesai tidak boleh sebelum mulai. */
export function DateFields({ values }: { values: EventFormData }) {
  const [startDate, setStartDate] = useState(values.startDate);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Start date (WIB)"
        htmlFor="startDate"
        hint="Leave empty if the date is not confirmed yet (shows “Date TBA”)."
      >
        <input
          id="startDate"
          name="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field
        label="End date (WIB)"
        htmlFor="endDate"
        hint="Optional, for multi-day events. Must not be before the start date."
      >
        <input
          id="endDate"
          name="endDate"
          type="date"
          defaultValue={values.endDate}
          min={startDate || undefined}
          className={inputClass}
        />
      </Field>
    </div>
  );
}