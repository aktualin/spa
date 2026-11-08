"use client";

import { useActionState } from "react";

import {
  addEventPhotoAction,
  deleteEventPhotoAction,
  moveEventPhotoAction,
  replaceEventPhotoAction,
  updateEventPhotoCaptionAction,
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
import { EventBulkUploader } from "./event-bulk-uploader";

export type EventPhotoRow = {
  id: string;
  imageUrl: string;
  caption: string;
  sortOrder: number;
};

const initialState: ActionState = { error: null };

/** Ganti berkas satu foto; caption dan urutan tetap. */
function ReplacePhotoForm({ photo, label }: { photo: EventPhotoRow; label: string }) {
  const [state, formAction] = useActionState(replaceEventPhotoAction, initialState);

  return (
    <details className="rounded-md border border-neutral-200 px-3 py-2">
      <summary className="cursor-pointer text-sm text-neutral-700">Ganti foto</summary>
      <form action={formAction} className="mt-3 space-y-3">
        <input type="hidden" name="id" value={photo.id} />
        <ImageField
          name="imageUrl"
          label={`Foto pengganti untuk ${label}`}
          folder="events"
          defaultValue={photo.imageUrl}
        />
        <p className="text-xs text-neutral-500">Caption dan urutan foto tidak berubah.</p>
        <ErrorAlert message={state.error} />
        <SmallSubmit title="Simpan foto pengganti">Simpan foto pengganti</SmallSubmit>
      </form>
    </details>
  );
}

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
              <li
                key={photo.id}
                className="flex flex-wrap items-start gap-4 rounded-lg border border-neutral-200 bg-white p-3"
              >
                <span className="w-6 shrink-0 pt-1 text-right text-xs tabular-nums text-neutral-400">
                  {index + 1}
                </span>
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded border border-neutral-200 bg-neutral-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || ""}
                    className="size-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <form
                    action={updateEventPhotoCaptionAction}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="id" value={photo.id} />
                    <input
                      aria-label={`Caption foto ${index + 1}`}
                      name="caption"
                      defaultValue={photo.caption}
                      placeholder="Caption (opsional)"
                      className={`${inputClass} min-w-0 flex-1`}
                    />
                    <SmallSubmit title={`Simpan caption foto ${index + 1}`}>
                      Simpan caption
                    </SmallSubmit>
                  </form>

                  <div className="flex flex-wrap items-center gap-2">
                    <form action={moveEventPhotoAction}>
                      <input type="hidden" name="id" value={photo.id} />
                      <input type="hidden" name="direction" value="up" />
                      <SmallSubmit
                        title={`Naikkan urutan foto ${index + 1}`}
                        disabled={index === 0}
                      >
                        ↑ Naikkan
                      </SmallSubmit>
                    </form>
                    <form action={moveEventPhotoAction}>
                      <input type="hidden" name="id" value={photo.id} />
                      <input type="hidden" name="direction" value="down" />
                      <SmallSubmit
                        title={`Turunkan urutan foto ${index + 1}`}
                        disabled={index === photos.length - 1}
                      >
                        ↓ Turunkan
                      </SmallSubmit>
                    </form>
                    <form action={deleteEventPhotoAction}>
                      <input type="hidden" name="id" value={photo.id} />
                      <ConfirmDeleteButton
                        message="Hapus foto ini dari event? File gambarnya ikut dihapus dari storage, kecuali tersimpan di Media Library."
                        className={`${secondaryButtonClass} text-red-700`}
                      >
                        Hapus foto
                      </ConfirmDeleteButton>
                    </form>
                  </div>

                  <ReplacePhotoForm photo={photo} label={`foto ${index + 1}`} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
