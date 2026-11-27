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
            aria-label={`Photo ${index + 1} caption`}
            name="caption"
            defaultValue={photo.caption}
            placeholder="Caption (optional)"
            className={`${inputClass} min-w-0 flex-1`}
          />
          <SmallSubmit title={`Save photo ${index + 1} caption`}>
            Save caption
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
              message="Delete this photo from the event? The image file will also be removed from storage, unless it is saved in the Media Library."
              className={`${secondaryButtonClass} text-red-700`}
            >
              Delete photo
            </ConfirmDeleteButton>
          </form>
        </div>

        <ReplacePhotoForm
          photoId={photo.id}
          imageUrl={photo.imageUrl}
          label={`photo ${index + 1}`}
          folder="events"
          hint="The photo caption and order stay the same."
          replaceAction={replaceEventPhotoAction}
        />
      </div>
    </li>
  );
}