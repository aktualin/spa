"use client";

import { useActionState } from "react";

import { addPhotoAction, type ActionState } from "../actions/gallery";
import { BulkUploader } from "./bulk-uploader";
import { AddPhotoSection } from "./photo-manager-add";
import { GalleryPhotoItem } from "./photo-manager-item";

export type PhotoRow = {
  id: string;
  imageUrl: string;
  caption: string;
  altText: string;
  sortOrder: number;
};

const initialState: ActionState = { error: null };

export function PhotoManager({
  albumId,
  photos,
}: {
  albumId: string;
  photos: PhotoRow[];
}) {
  const [state, formAction] = useActionState(addPhotoAction, initialState);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Upload multiple photos
        </h2>
        <BulkUploader albumId={albumId} />
      </section>

      <AddPhotoSection albumId={albumId} formAction={formAction} error={state.error} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Photos in album ({photos.length})
        </h2>

        {photos.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No photos in this album yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {photos.map((photo, index) => (
              <GalleryPhotoItem
                key={photo.id}
                photo={photo}
                index={index}
                count={photos.length}
                albumId={albumId}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}