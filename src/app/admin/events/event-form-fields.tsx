"use client";

import { ImageField } from "../image-field";
import { Checkbox, Field, inputClass } from "../promos/_kit/form-ui";
import { RichTextField } from "../rich-text-field";
import { CollaborationFields } from "./event-collaboration";
import { DateFields } from "./event-form-dates";
import { TitleSlugFields } from "./event-form-slug";
import type { EventFormData } from "./event-form.types";
import { EventStatusRules } from "./status-rules";

/** Seluruh isian event (dipakai di dalam form utama). */
export function EventFields({
  values,
  publishedSlug,
}: {
  values: EventFormData;
  publishedSlug: string | null;
}) {
  return (
    <>
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}

      <TitleSlugFields values={values} publishedSlug={publishedSlug} />

      <RichTextField
        name="description"
        label="Description"
        defaultValue={values.description}
        folder="events"
        compact
      />

      <ImageField
        name="coverUrl"
        label="Cover image"
        folder="events"
        defaultValue={values.coverUrl}
      />

      <Field label="Location" htmlFor="location">
        <input
          id="location"
          name="location"
          defaultValue={values.location}
          placeholder="e.g. KAMA Spa, South Jakarta"
          className={inputClass}
        />
      </Field>

      <DateFields values={values} />

      <EventStatusRules compact />

      <Field
        label="Display order"
        htmlFor="sortOrder"
        hint="Default 0. Lower values appear higher in their group; equal values are sorted by date."
      >
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={values.sortOrder}
          className={`${inputClass} w-28`}
        />
      </Field>

      <CollaborationFields values={values} />

      <Checkbox name="isPublished" defaultChecked={values.isPublished}>
        Show on website
      </Checkbox>
    </>
  );
}