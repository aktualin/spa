"use client";

import Link from "next/link";

import { ImageField } from "../image-field";
import { Field, inputClass } from "../settings/_components/form-ui";
import {
  BANNER_LIMITS,
  type BannerDefaults,
  type BannerKey,
} from "@/lib/domain/homepage-banner";
import type { HomepageSectionRow } from "./homepage-section-shared";

/** Fieldset gambar banner: gambar utama, mobile, dan alt text. */
export function BannerImageFields({
  section,
  bannerKey,
  defaults,
  decorativeImage,
}: {
  section: HomepageSectionRow;
  bannerKey: BannerKey;
  defaults: BannerDefaults;
  decorativeImage: boolean;
}) {
  const id = section.id;
  return (
    <fieldset className="space-y-4 rounded-md border border-neutral-200 p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Image
      </legend>

      {bannerKey === "hero" ? (
        <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
          The slider (photos/videos) is managed in{" "}
          <Link
            href="/admin/homepage/hero"
            className="font-medium underline underline-offset-2"
          >
            Manage Hero slides
          </Link>
          . The main image below is only used as a fallback while the slide
          table is still empty.
        </p>
      ) : null}

      <ImageField
        name="imageUrl"
        label="Main image"
        folder="homepage"
        defaultValue={section.imageUrl}
      />
      <p className="text-xs text-neutral-500">
        Empty = default image ({defaults.imageUrl}).{" "}
        {bannerKey === "hero"
          ? "Landscape at least 1920×1080 px recommended, JPG/WebP under 1 MB."
          : "4:3 ratio recommended, at least 1200×900 px, JPG/WebP under 1 MB."}
      </p>

      <ImageField
        name="mobileImageUrl"
        label="Mobile-only image (optional)"
        folder="homepage"
        defaultValue={section.mobileImageUrl}
      />
      <p className="text-xs text-neutral-500">
        Used on screens below 768 px. Empty = the main image is also
        used on mobile. Portrait recommended, e.g. 1080×1350 px.
      </p>

      <Field
        label={decorativeImage ? "Alt text (optional)" : "Alt text"}
        htmlFor={`imageAlt-${id}`}
        hint={
          decorativeImage
            ? "The hero image is a decorative background behind the title, so this may be left empty (screen readers skip it). Fill in only if the image carries important information."
            : "Required when the image is replaced: briefly describe the image for screen readers and search engines."
        }
      >
        <input
          id={`imageAlt-${id}`}
          name="imageAlt"
          defaultValue={section.imageAlt}
          maxLength={BANNER_LIMITS.imageAlt}
          placeholder={defaults.imageAlt || undefined}
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}