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
        label="Tanggal mulai (WIB)"
        htmlFor="startDate"
        hint="Kosongkan bila tanggal belum pasti (tampil “Tanggal menyusul”)."
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
        label="Tanggal selesai (WIB)"
        htmlFor="endDate"
        hint="Opsional, untuk event lebih dari satu hari. Tidak boleh sebelum tanggal mulai."
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