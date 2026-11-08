/**
 * Lightbox galeri — komponen client tanpa dependency.
 *
 * Navigasi: klik foto untuk membuka, tombol tutup, dan keyboard
 * Esc (tutup), ← (sebelumnya), → (berikutnya).
 */
"use client";

import { useCallback, useEffect, useState } from "react";

import { Close, ArrowLeft, ArrowRight } from "@/components/icons";

export type LightboxPhoto = {
  imageUrl: string;
  caption: string | null;
  altText: string | null;
};

type GalleryLightboxProps = {
  photos: LightboxPhoto[];
  /** Indeks foto yang dibuka pertama kali; null = lightbox tertutup. */
  initialIndex?: number | null;
};

export function GalleryLightbox({ photos, initialIndex = null }: GalleryLightboxProps) {
  const [index, setIndex] = useState<number | null>(initialIndex);

  const close = useCallback(() => setIndex(null), []);
  const previous = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (index === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [index, close, previous, next]);

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
        aria-label="Tutup pratinjau"
        className="absolute right-4 top-4 rounded-full p-2 text-cream-soft transition hover:bg-white/10"
      >
        <Close className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          previous();
        }}
        aria-label="Foto sebelumnya"
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-cream-soft transition hover:bg-white/10 sm:left-6"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <figure
        className="flex max-h-full w-full max-w-4xl flex-col items-center gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.imageUrl}
          alt={photo.altText || photo.caption || "Foto galeri KAMA Spa"}
          className="max-h-[70vh] w-auto max-w-full object-contain"
        />
        {photo.caption ? (
          <figcaption className="text-center text-caption text-cream-soft">
            {photo.caption}
          </figcaption>
        ) : null}
      </figure>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          next();
        }}
        aria-label="Foto berikutnya"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-cream-soft transition hover:bg-white/10 sm:right-6"
      >
        <ArrowRight className="h-6 w-6" />
      </button>

      <span className="mt-4 text-caption text-cream-soft/80">
        {index + 1} / {photos.length}
      </span>
    </div>
  );
}

export default GalleryLightbox;
