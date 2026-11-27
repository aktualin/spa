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
          <strong>Collaboration</strong> event with a partner/brand/company. Once it
          passes, the event moves to the <strong>Past Collaborations</strong> page{" "}
          (<code>/events/collaborations</code>) instead of “Past”.
        </span>
      </label>

      {/* Disembunyikan saja (tidak dilepas) supaya isian tidak hilang. */}
      <div className={isCollaboration ? "space-y-4 pt-2" : "hidden"}>
        <Field label="Partner name" htmlFor="partnerName">
          <input
            id="partnerName"
            name="partnerName"
            defaultValue={values.partnerName}
            placeholder="e.g. PT Sehat Sentosa"
            className={inputClass}
          />
        </Field>
        <ImageField
          name="partnerLogoUrl"
          label="Partner logo (optional — only shown when filled in)"
          folder="events"
          defaultValue={values.partnerLogoUrl}
        />
        <Field
          label="Partner link"
          htmlFor="partnerUrl"
          hint="Optional. Partner website/Instagram, e.g. https://brandname.com"
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