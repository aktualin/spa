/**
 * Lightbox galeri — komponen client tanpa dependency.
 *
 * Navigasi: klik foto untuk membuka, tombol tutup, dan keyboard
 * Esc (tutup), ← (sebelumnya), → (berikutnya).
 */
"use client";

import { fillCopy } from "@/components/copy-text";
import { Close } from "@/components/icons";
import { useLightboxIndex } from "./gallery-lightbox-hooks";
import { LightboxArrow } from "./gallery-lightbox-parts";

export type LightboxPhoto = {
  imageUrl: string;
  caption: string | null;
  altText: string | null;
};

/** Teks aksesibel galeri dari CB (grup "gallery"); {n}/{m} diganti saat render. */
export type GalleryLabels = {
  altFallback: string;
  gridAria: string;
  lightboxPrev: string;
  lightboxNext: string;
  lightboxClose: string;
  lightboxCounter: string;
};

type GalleryLightboxProps = {
  photos: LightboxPhoto[];
  /** Indeks foto yang dibuka pertama kali; null = lightbox tertutup. */
  initialIndex?: number | null;
  labels: GalleryLabels;
};

export function GalleryLightbox({ photos, initialIndex = null, labels }: GalleryLightboxProps) {
  const { index, close, previous, next } = useLightboxIndex(photos.length, initialIndex);

  if (index === null) return null;

  const photo = photos[index];
  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-espresso/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau foto"
      onClick={close}
    >
      <button
        type="button"
        onClick={close}
        aria-label={labels.lightboxClose}
        className="absolute right-4 top-4 rounded-full p-2 text-cream-soft transition hover:bg-white/10"
      >
        <Close className="h-6 w-6" />
      </button>

      <LightboxArrow direction="prev" label={labels.lightboxPrev} onClick={previous} />

      <figure
        className="flex max-h-full w-full max-w-4xl flex-col items-center gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.imageUrl}
          alt={photo.altText || photo.caption || labels.altFallback}
          className="max-h-[70vh] w-auto max-w-full object-contain"
        />
        {photo.caption ? (
          <figcaption className="text-center text-caption text-cream-soft">
            {photo.caption}
          </figcaption>
        ) : null}
      </figure>

      <LightboxArrow direction="next" label={labels.lightboxNext} onClick={next} />

      <span className="mt-4 text-caption text-cream-soft/80">
        {fillCopy(labels.lightboxCounter, { n: index + 1, m: photos.length })}
      </span>
    </div>
  );
}

export default GalleryLightbox;