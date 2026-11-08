/**
 * Grid foto album galeri yang bisa diklik untuk membuka lightbox.
 *
 * Komponen client tipis: seluruh markup foto tetap di sini, sementara overlay
 * pratinjau ditangani `GalleryLightbox`. Tanpa JavaScript, grid-nya tetap
 * tampil utuh — hanya pratinjaunya yang tidak terbuka.
 */
"use client";

import { useState } from "react";

import { GalleryLightbox, type LightboxPhoto } from "./gallery-lightbox";

type GalleryGridProps = {
  photos: LightboxPhoto[];
};

export function GalleryGrid({ photos }: GalleryGridProps) {
  // `GalleryLightbox` menutup dirinya sendiri lewat state internalnya, jadi
  // setiap klik harus memasangnya ulang. `openNonce` naik tiap klik dan masuk
  // ke `key`, sehingga foto yang sama bisa dibuka berkali-kali.
  const [open, setOpen] = useState<{ index: number; nonce: number } | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <button
            key={`${photo.imageUrl}-${index}`}
            type="button"
            onClick={() =>
              setOpen((current) => ({
                index,
                nonce: (current?.nonce ?? 0) + 1,
              }))
            }
            aria-label={`Buka foto ${index + 1} dari ${photos.length}`}
            className="image-container aspect-[4/3] overflow-hidden transition-opacity hover:opacity-90"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.imageUrl}
              alt={photo.altText || photo.caption || "Foto galeri KAMA Spa"}
              loading="lazy"
              className="image-cover"
            />
          </button>
        ))}
      </div>

      {open ? (
        <GalleryLightbox
          key={open.nonce}
          photos={photos}
          initialIndex={open.index}
        />
      ) : null}
    </>
  );
}
