"use client";

import { useActionState } from "react";

import { addEventPhotoAction, type ActionState } from "../actions/events";
import { ImageField } from "../image-field";
import { ErrorAlert, Field, SaveButton, inputClass } from "../promos/_kit/form-ui";
import { EventBulkUploader } from "./event-bulk-uploader";
import { EventPhotoItem } from "./event-photo-item";

export type EventPhotoRow = {
  id: string;
  imageUrl: string;
  caption: string;
  sortOrder: number;
};

const initialState: ActionState = { error: null };

export function EventPhotoManager({
  eventId,
  photos,
}: {
  eventId: string;
  photos: EventPhotoRow[];
}) {
  const [state, formAction] = useActionState(addEventPhotoAction, initialState);

  return (
    <div id="foto" className="scroll-mt-6 space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Upload multiple event photos
        </h2>
        <EventBulkUploader eventId={eventId} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Add a single photo
        </h2>
        <p className="text-sm text-neutral-600">
          For one photo with its caption at once, or a photo that already exists in the
          Media Library.
        </p>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="eventId" value={eventId} />

          <ImageField name="imageUrl" label="Photo" folder="events" defaultValue="" />

          <Field label="Caption" htmlFor="caption">
            <input id="caption" name="caption" defaultValue="" className={inputClass} />
          </Field>

          <ErrorAlert message={state.error} />

          <SaveButton label="Add photo" />
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Event photos ({photos.length})
        </h2>
        <p className="text-xs text-neutral-500">
          The order below matches the gallery order on the event detail page.
        </p>

        {photos.length === 0 ? (
          <p className="text-sm text-neutral-500">No photos for this event yet.</p>
        ) : (
          <ul className="space-y-3">
            {photos.map((photo, index) => (
              <EventPhotoItem
                key={photo.id}
                photo={photo}
                index={index}
                count={photos.length}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}