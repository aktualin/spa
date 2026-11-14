"use client";

import { useState } from "react";

import { ImageField } from "../image-field";
import { Field, inputClass } from "../promos/_kit/form-ui";
import type { EventFormData } from "./event-form.types";

/** Checkbox kolaborasi + isian mitra (disembunyikan, bukan dilepas). */
export function CollaborationFields({ values }: { values: EventFormData }) {
  const [isCollaboration, setIsCollaboration] = useState(values.isCollaboration);
  return (
    <div className="space-y-3 rounded-md border border-neutral-200 p-4">
      <label className="flex items-start gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="isCollaboration"
          checked={isCollaboration}
          onChange={(e) => setIsCollaboration(e.target.checked)}
          className="mt-0.5 size-4 rounded border-neutral-300"
        />
        <span>
          Event <strong>kolaborasi</strong> dengan mitra/brand/perusahaan. Setelah
          lewat, event pindah ke halaman <strong>Past Collaborations</strong>{" "}
          (<code>/events/collaborations</code>), bukan ke “Telah berlalu”.
        </span>
      </label>

      {/* Disembunyikan saja (tidak dilepas) supaya isian tidak hilang. */}
      <div className={isCollaboration ? "space-y-4 pt-2" : "hidden"}>
        <Field label="Nama mitra" htmlFor="partnerName">
          <input
            id="partnerName"
            name="partnerName"
            defaultValue={values.partnerName}
            placeholder="Contoh: PT Sehat Sentosa"
            className={inputClass}
          />
        </Field>
        <ImageField
          name="partnerLogoUrl"
          label="Logo mitra (opsional — hanya tampil bila diisi)"
          folder="events"
          defaultValue={values.partnerLogoUrl}
        />
        <Field
          label="Tautan mitra"
          htmlFor="partnerUrl"
          hint="Opsional. Situs/Instagram mitra, contoh: https://namabrand.com"
        >
          <input
            id="partnerUrl"
            name="partnerUrl"
            defaultValue={values.partnerUrl}
            inputMode="url"
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  );
}