"use client";

import {
  deleteEventPhotoAction,
  moveEventPhotoAction,
  replaceEventPhotoAction,
  updateEventPhotoCaptionAction,
} from "../actions/events";
import {
  PhotoMoveButtons,
  PhotoThumb,
  ReplacePhotoForm,
} from "../_components/photo-manager-parts";
import {
  ConfirmDeleteButton,
  SmallSubmit,
  inputClass,
  secondaryButtonClass,
} from "../promos/_kit/form-ui";
import type { EventPhotoRow } from "./event-photo-manager";

/** Satu baris foto event: caption, urutan, hapus, dan ganti berkas. */
export function EventPhotoItem({
  photo,
  index,
  count,
}: {
  photo: EventPhotoRow;
  index: number;
  count: number;
}) {
  return (
    <li className="flex flex-wrap items-start gap-4 rounded-lg border border-neutral-200 bg-white p-3">
      <PhotoThumb index={index} imageUrl={photo.imageUrl} alt={photo.caption || ""} />

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
          <PhotoMoveButtons
            photoId={photo.id}
            index={index}
            count={count}
            moveAction={moveEventPhotoAction}
          />
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

        <ReplacePhotoForm
          photoId={photo.id}
          imageUrl={photo.imageUrl}
          label={`foto ${index + 1}`}
          folder="events"
          hint="Caption dan urutan foto tidak berubah."
          replaceAction={replaceEventPhotoAction}
        />
      </div>
    </li>
  );
}