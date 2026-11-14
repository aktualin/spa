"use client";

import { useActionState } from "react";

import type { ActionState } from "../actions/gallery";
import { ImageField } from "../image-field";
import { ErrorAlert, SmallSubmit } from "../promos/_kit/form-ui";

const initialState: ActionState = { error: null };

/** Nomor urut + thumbnail foto (dipakai manajer foto Gallery & Events). */
export function PhotoThumb({
  index,
  imageUrl,
  alt,
}: {
  index: number;
  imageUrl: string;
  alt: string;
}) {
  return (
    <>
      <span className="w-6 shrink-0 pt-1 text-right text-xs tabular-nums text-neutral-400">
        {index + 1}
      </span>
      <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded border border-neutral-200 bg-neutral-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={alt} className="size-full object-cover" />
      </div>
    </>
  );
}

/** Tombol naik/turun urutan foto. */
export function PhotoMoveButtons({
  photoId,
  index,
  count,
  moveAction,
}: {
  photoId: string;
  index: number;
  count: number;
  moveAction: (formData: FormData) => void;
}) {
  return (
    <>
      <form action={moveAction}>
        <input type="hidden" name="id" value={photoId} />
        <input type="hidden" name="direction" value="up" />
        <SmallSubmit
          title={`Naikkan urutan foto ${index + 1}`}
          disabled={index === 0}
        >
          ↑ Naikkan
        </SmallSubmit>
      </form>
      <form action={moveAction}>
        <input type="hidden" name="id" value={photoId} />
        <input type="hidden" name="direction" value="down" />
        <SmallSubmit
          title={`Turunkan urutan foto ${index + 1}`}
          disabled={index === count - 1}
        >
          ↓ Turunkan
        </SmallSubmit>
      </form>
    </>
  );
}

/** Ganti berkas satu foto; caption/alt/urutan tetap (teks hint dari pemanggil). */
export function ReplacePhotoForm({
  photoId,
  imageUrl,
  label,
  folder,
  hint,
  replaceAction,
}: {
  photoId: string;
  imageUrl: string;
  label: string;
  folder: string;
  hint: string;
  replaceAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(replaceAction, initialState);

  return (
    <details className="rounded-md border border-neutral-200 px-3 py-2">
      <summary className="cursor-pointer text-sm text-neutral-700">
        Ganti foto
      </summary>
      <form action={formAction} className="mt-3 space-y-3">
        <input type="hidden" name="id" value={photoId} />
        <ImageField
          name="imageUrl"
          label={`Foto pengganti untuk ${label}`}
          folder={folder}
          defaultValue={imageUrl}
        />
        <p className="text-xs text-neutral-500">{hint}</p>
        <ErrorAlert message={state.error} />
        <SmallSubmit title="Simpan foto pengganti">Simpan foto pengganti</SmallSubmit>
      </form>
    </details>
  );
}