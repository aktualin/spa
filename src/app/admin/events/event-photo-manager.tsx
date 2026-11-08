"use client";

import { useActionState } from "react";

import {
  addEventPhotoAction,
  deleteEventPhotoAction,
  moveEventPhotoAction,
  type ActionState,
} from "../actions/events";
import { ImageField } from "../image-field";
import {
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  SmallSubmit,
  inputClass,
  secondaryButtonClass,
} from "../promos/_kit/form-ui";

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
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Tambah foto event
        </h2>

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

        {photos.length === 0 ? (
          <p className="text-sm text-neutral-500">Belum ada foto untuk event ini.</p>
        ) : (
          <ul className="space-y-3">
            {photos.map((photo, index) => (
              <li
                key={photo.id}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-neutral-200 bg-white p-3"
              >
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded border border-neutral-200 bg-neutral-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || ""}
                    className="size-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-neutral-700">
                    {photo.caption || `Foto ${index + 1}`}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <form action={moveEventPhotoAction}>
                      <input type="hidden" name="id" value={photo.id} />
                      <input type="hidden" name="direction" value="up" />
                      <SmallSubmit title="Naikkan urutan">↑ Naikkan</SmallSubmit>
                    </form>
                    <form action={moveEventPhotoAction}>
                      <input type="hidden" name="id" value={photo.id} />
                      <input type="hidden" name="direction" value="down" />
                      <SmallSubmit title="Turunkan urutan">↓ Turunkan</SmallSubmit>
                    </form>
                    <form action={deleteEventPhotoAction}>
                      <input type="hidden" name="id" value={photo.id} />
                      <ConfirmDeleteButton
                        message="Hapus foto ini? File gambarnya juga dihapus dari storage."
                        className={`${secondaryButtonClass} text-red-700`}
                      >
                        Hapus foto
                      </ConfirmDeleteButton>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
