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
        ← Back to the slide list
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {slide.id ? "Edit hero slide" : "Add hero slide"}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        This slide only changes the media. The hero text, eyebrow, and button are
        managed in Homepage Sections.
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        {slide.id ? <input type="hidden" name="id" value={slide.id} /> : null}

        <Field
          label="Media type"
          htmlFor="mediaType"
          hint="Video plays automatically without sound and stops when the cursor/focus is in the hero, the tab is inactive, or the visitor uses reduced motion."
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
            <option value="IMAGE">Photo</option>
            <option value="VIDEO">Video</option>
          </select>
        </Field>

        <HeroSlideMediaFields slide={slide} isVideo={isVideo} />

        <Checkbox name="isPublished" defaultChecked={slide.isPublished}>
          Publish on the homepage
        </Checkbox>

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton label={slide.id ? "Save slide" : "Add slide"} />
          <Link href={LIST_PATH} className="text-sm text-neutral-600 hover:underline">
            Cancel
          </Link>
        </div>
      </form>

      {slide.id ? (
        <form
          action={deleteHeroSlideAction}
          className="mt-8 border-t border-neutral-200 pt-4"
        >
          <input type="hidden" name="id" value={slide.id} />
          <ConfirmDeleteButton message="Delete this slide? Images/posters recorded in the Media Library are kept; video files are not deleted.">
            Delete this slide
          </ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}