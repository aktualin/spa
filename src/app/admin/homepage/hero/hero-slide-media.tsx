"use client";

import { HERO_SLIDE_LIMITS } from "@/lib/domain/hero-slide";

import { ImageField } from "../../image-field";
import { Field, inputClass } from "../../promos/_kit/form-ui";
import type { HeroSlideFormData } from "./hero-slide-form.types";

/** Fieldset media slide: gambar/poster, video atau gambar mobile, dan alt. */
export function HeroSlideMediaFields({
  slide,
  isVideo,
}: {
  slide: HeroSlideFormData;
  isVideo: boolean;
}) {
  return (
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
            hint="File langsung .mp4/.webm dari bucket S3, mis. https://…/storage/v1/object/public/vip-book/video/incense-smoke.mp4. Tautan halaman YouTube/Vimeo tidak didukung."
          >
            <input
              id="videoUrl"
              name="videoUrl"
              type="text"
              inputMode="url"
              defaultValue={slide.videoUrl}
              maxLength={HERO_SLIDE_LIMITS.videoUrl}
              placeholder="https://…/vip-book/video/incense-smoke.mp4"
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
  );
}