"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import type { HeroSlideMediaType } from "@/lib/domain/hero-slide";

import {
  deleteHeroSlideAction,
  saveHeroSlideAction,
} from "../../actions/hero-slides";
import {
  Checkbox,
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  inputClass,
} from "../../promos/_kit/form-ui";
import { LIST_PATH, initialState, type HeroSlideFormData } from "./hero-slide-form.types";
import { HeroSlideMediaFields } from "./hero-slide-media";

export type { HeroSlideFormData } from "./hero-slide-form.types";

export function HeroSlideForm({ slide }: { slide: HeroSlideFormData }) {
  const [state, formAction] = useActionState(
    saveHeroSlideAction,
    initialState,
  );
  const [mediaType, setMediaType] = useState<HeroSlideMediaType>(slide.mediaType);
  const isVideo = mediaType === "VIDEO";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={LIST_PATH} className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar slide
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {slide.id ? "Ubah slide hero" : "Tambah slide hero"}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Slide ini hanya mengganti media. Teks, eyebrow, dan tombol hero diatur
        di Section Homepage.
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        {slide.id ? <input type="hidden" name="id" value={slide.id} /> : null}

        <Field
          label="Tipe media"
          htmlFor="mediaType"
          hint="Video diputar otomatis tanpa suara dan berhenti saat kursor/fokus berada di hero, tab tidak aktif, atau pengunjung memakai reduced motion."
        >
          <select
            id="mediaType"
            name="mediaType"
            value={mediaType}
            onChange={(event) =>
              setMediaType(event.target.value === "VIDEO" ? "VIDEO" : "IMAGE")
            }
            className={inputClass}
          >
            <option value="IMAGE">Foto</option>
            <option value="VIDEO">Video</option>
          </select>
        </Field>

        <HeroSlideMediaFields slide={slide} isVideo={isVideo} />

        <Checkbox name="isPublished" defaultChecked={slide.isPublished}>
          Terbitkan di homepage
        </Checkbox>

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton label={slide.id ? "Simpan slide" : "Tambah slide"} />
          <Link href={LIST_PATH} className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {slide.id ? (
        <form
          action={deleteHeroSlideAction}
          className="mt-8 border-t border-neutral-200 pt-4"
        >
          <input type="hidden" name="id" value={slide.id} />
          <ConfirmDeleteButton message="Hapus slide ini? Gambar/poster yang tercatat di Media Library tetap tersimpan; file video tidak dihapus.">
            Hapus slide ini
          </ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}