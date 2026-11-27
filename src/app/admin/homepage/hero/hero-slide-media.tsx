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
        label={isVideo ? "Video poster (required)" : "Slide image (required)"}
        folder="homepage"
        defaultValue={slide.imageUrl}
      />
      <p className="text-xs text-neutral-500">
        {isVideo
          ? "The poster is shown before the video loads and when autoplay is blocked. Landscape, at least 1920×1080 px, JPG/WebP under 1 MB recommended."
          : "Landscape, at least 1920×1080 px, JPG/WebP under 1 MB recommended."}
      </p>

      {isVideo ? (
        <>
          <Field
            label="Video URL"
            htmlFor="videoUrl"
            hint="Direct .mp4/.webm file from the S3 bucket, e.g. https://…/storage/v1/object/public/kama/video/incense-smoke.mp4. YouTube/Vimeo page links are not supported."
          >
            <input
              id="videoUrl"
              name="videoUrl"
              type="text"
              inputMode="url"
              defaultValue={slide.videoUrl}
              maxLength={HERO_SLIDE_LIMITS.videoUrl}
              placeholder="https://…/kama/video/incense-smoke.mp4"
              autoComplete="off"
              className={inputClass}
            />
          </Field>
          <p className="text-xs text-neutral-500">
            Videos are not uploaded to the Media Library; upload the file to hosting
            or place it in the <code>public/video</code> folder, then fill in
            its URL here.
          </p>
        </>
      ) : (
        <>
          <ImageField
            name="mobileImageUrl"
            label="Mobile-only image (optional)"
            folder="homepage"
            defaultValue={slide.mobileImageUrl}
          />
          <p className="text-xs text-neutral-500">
            Used on screens below 768 px. Empty = the main image is also
            used on mobile. Portrait recommended, e.g. 1080×1350 px.
          </p>
        </>
      )}

      <Field
        label="Alt text (optional)"
        htmlFor="imageAlt"
        hint="The hero title is already read out by screen readers. Fill in only if the media carries important information."
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