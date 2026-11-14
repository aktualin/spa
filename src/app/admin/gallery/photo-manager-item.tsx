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
            aria-label={`Caption foto ${index + 1}`}
            name="caption"
            defaultValue={photo.caption}
            placeholder="Caption"
            className={inputClass}
          />
          <input
            aria-label={`Teks alternatif foto ${index + 1}`}
            name="altText"
            defaultValue={photo.altText}
            placeholder="Alt text"
            className={inputClass}
          />
          <div className="sm:col-span-2">
            <SmallSubmit title="Simpan caption & alt text">
              Simpan caption
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
              message="Hapus foto ini dari album? File gambarnya ikut dihapus dari storage, kecuali tersimpan di Media Library."
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
          folder="gallery"
          hint="Caption, alt text, dan urutan foto tidak berubah."
          replaceAction={replacePhotoAction}
        />
      </div>
    </li>
  );
}