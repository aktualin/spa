"use client";

import { useActionState } from "react";

import {
  addPhotoAction,
  deletePhotoAction,
  movePhotoAction,
  updatePhotoMetaAction,
  type ActionState,
} from "../actions/gallery";
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
          Tambah foto
        </h2>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="albumId" value={albumId} />

          <ImageField
            name="imageUrl"
            label="Foto"
            folder="gallery"
            defaultValue=""
          />

          <Field label="Caption" htmlFor="caption">
            <input
              id="caption"
              name="caption"
              defaultValue=""
              className={inputClass}
            />
          </Field>

          <Field
            label="Teks alternatif (alt)"
            htmlFor="altText"
            hint="Deskripsi singkat foto untuk aksesibilitas dan SEO."
          >
            <input
              id="altText"
              name="altText"
              defaultValue=""
              className={inputClass}
            />
          </Field>

          <ErrorAlert message={state.error} />

          <SaveButton label="Tambah foto" />
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Foto dalam album ({photos.length})
        </h2>

        {photos.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Belum ada foto di album ini.
          </p>
        ) : (
          <ul className="space-y-3">
            {photos.map((photo, index) => (
              <li
                key={photo.id}
                className="flex flex-wrap items-start gap-4 rounded-lg border border-neutral-200 bg-white p-3"
              >
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded border border-neutral-200 bg-neutral-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={photo.altText || photo.caption || ""}
                    className="size-full object-cover"
                  />
                </div>

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
                    <form action={movePhotoAction}>
                      <input type="hidden" name="id" value={photo.id} />
                      <input type="hidden" name="direction" value="up" />
                      <SmallSubmit title="Naikkan urutan">↑ Naikkan</SmallSubmit>
                    </form>
                    <form action={movePhotoAction}>
                      <input type="hidden" name="id" value={photo.id} />
                      <input type="hidden" name="direction" value="down" />
                      <SmallSubmit title="Turunkan urutan">↓ Turunkan</SmallSubmit>
                    </form>
                    <form action={deletePhotoAction}>
                      <input type="hidden" name="id" value={photo.id} />
                      <input type="hidden" name="albumId" value={albumId} />
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
