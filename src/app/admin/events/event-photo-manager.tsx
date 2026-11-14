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
          Unggah banyak foto event
        </h2>
        <EventBulkUploader eventId={eventId} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Tambah satu foto
        </h2>
        <p className="text-sm text-neutral-600">
          Untuk satu foto dengan caption sekaligus, atau foto yang sudah ada di Media
          Library.
        </p>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="eventId" value={eventId} />

          <ImageField name="imageUrl" label="Foto" folder="events" defaultValue="" />

          <Field label="Caption" htmlFor="caption">
            <input id="caption" name="caption" defaultValue="" className={inputClass} />
          </Field>

          <ErrorAlert message={state.error} />

          <SaveButton label="Tambah foto" />
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Foto event ({photos.length})
        </h2>
        <p className="text-xs text-neutral-500">
          Urutan di bawah sama dengan urutan galeri di halaman detail event.
        </p>

        {photos.length === 0 ? (
          <p className="text-sm text-neutral-500">Belum ada foto untuk event ini.</p>
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