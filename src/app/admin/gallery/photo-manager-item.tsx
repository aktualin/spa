"use client";

import {
  deletePhotoAction,
  movePhotoAction,
  replacePhotoAction,
  updatePhotoMetaAction,
} from "../actions/gallery";
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
import type { PhotoRow } from "./photo-manager";

/** Satu baris foto album: caption/alt, urutan, hapus, dan ganti berkas. */
export function GalleryPhotoItem({
  photo,
  index,
  count,
  albumId,
}: {
  photo: PhotoRow;
  index: number;
  count: number;
  albumId: string;
}) {
  return (
    <li className="flex flex-wrap items-start gap-4 rounded-lg border border-neutral-200 bg-white p-3">
      <PhotoThumb
        index={index}
        imageUrl={photo.imageUrl}
        alt={photo.altText || photo.caption || ""}
      />

      <div className="min-w-0 flex-1 space-y-3">
        <form
          action={updatePhotoMetaAction}
          className="grid gap-2 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={photo.id} />
          <input
            aria-label={`Photo ${index + 1} caption`}
            name="caption"
            defaultValue={photo.caption}
            placeholder="Caption"
            className={inputClass}
          />
          <input
            aria-label={`Photo ${index + 1} alt text`}
            name="altText"
            defaultValue={photo.altText}
            placeholder="Alt text"
            className={inputClass}
          />
          <div className="sm:col-span-2">
            <SmallSubmit title="Save caption & alt text">
              Save caption
            </SmallSubmit>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <PhotoMoveButtons
            photoId={photo.id}
            index={index}
            count={count}
            moveAction={movePhotoAction}
          />
          <form action={deletePhotoAction}>
            <input type="hidden" name="id" value={photo.id} />
            <input type="hidden" name="albumId" value={albumId} />
            <ConfirmDeleteButton
              message="Delete this photo from the album? The image file will also be removed from storage, unless it is saved in the Media Library."
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
          folder="gallery"
          hint="The photo caption, alt text, and order stay the same."
          replaceAction={replacePhotoAction}
        />
      </div>
    </li>
  );
}