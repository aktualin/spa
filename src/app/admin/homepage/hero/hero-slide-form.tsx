"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { HERO_SLIDE_LIMITS, type HeroSlideMediaType } from "@/lib/domain/hero-slide";

import {
  deleteHeroSlideAction,
  saveHeroSlideAction,
  type ActionState,
} from "../../actions/hero-slides";
import { ImageField } from "../../image-field";
import {
  Checkbox,
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  inputClass,
} from "../../promos/_kit/form-ui";

export type HeroSlideFormData = {
  id: string | null;
  mediaType: HeroSlideMediaType;
  imageUrl: string;
  mobileImageUrl: string;
  videoUrl: string;
  imageAlt: string;
  isPublished: boolean;
};

const initialState: ActionState = { error: null };
const LIST_PATH = "/admin/homepage/hero";

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

        <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
          <legend className="px-1 text-sm font-medium text-neutral-700">Media</legend>

          <ImageField
            name="imageUrl"
            label={isVideo ? "Poster video (wajib)" : "Gambar slide (wajib)"}
            folder="homepage"
            defaultValue={slide.imageUrl}
          />
          <p className="text-xs text-neutral-500">
            {isVideo
              ? "Poster tampil sebelum video dimuat dan saat autoplay diblokir. Disarankan lanskap minimal 1920×1080 px, JPG/WebP di bawah 1 MB."
              : "Disarankan lanskap minimal 1920×1080 px, JPG/WebP di bawah 1 MB."}
          </p>

          {isVideo ? (
            <>
              <Field
                label="URL video"
                htmlFor="videoUrl"
                hint="File langsung .mp4/.webm, mis. /video/incense-smoke.mp4 atau https://cdn…/hero.mp4. Tautan halaman YouTube/Vimeo tidak didukung."
              >
                <input
                  id="videoUrl"
                  name="videoUrl"
                  type="text"
                  inputMode="url"
                  defaultValue={slide.videoUrl}
                  maxLength={HERO_SLIDE_LIMITS.videoUrl}
                  placeholder="/video/incense-smoke.mp4"
                  autoComplete="off"
                  className={inputClass}
                />
              </Field>
              <p className="text-xs text-neutral-500">
                Video tidak diunggah ke Media Library; unggah file ke hosting
                atau letakkan di folder <code>public/video</code>, lalu isi
                URL-nya di sini.
              </p>
            </>
          ) : (
            <>
              <ImageField
                name="mobileImageUrl"
                label="Gambar khusus mobile (opsional)"
                folder="homepage"
                defaultValue={slide.mobileImageUrl}
              />
              <p className="text-xs text-neutral-500">
                Dipakai pada layar di bawah 768 px. Kosong = gambar utama juga
                dipakai di mobile. Disarankan potret, mis. 1080×1350 px.
              </p>
            </>
          )}

          <Field
            label="Teks alt (opsional)"
            htmlFor="imageAlt"
            hint="Judul hero sudah dibacakan pembaca layar. Isi hanya bila media membawa informasi penting."
          >
            <input
              id="imageAlt"
              name="imageAlt"
              defaultValue={slide.imageAlt}
              maxLength={HERO_SLIDE_LIMITS.imageAlt}
              className={inputClass}
            />
          </Field>
        </fieldset>

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
