"use client";

import type { CarouselImage } from "./image-carousel-types";

/**
 * Mode satu gambar: `<img>` biasa dengan markup identik seperti sebelum
 * ada carousel.
 */
export function CarouselSingleImage({
  image,
  alt,
  imageClassName,
  eager,
}: {
  image: CarouselImage;
  /** Alt fallback bila gambar tidak punya altText sendiri. */
  alt: string;
  imageClassName: string;
  eager: boolean;
}) {
  return (
    // Sumbernya URL eksternal arbitrer dari Supabase Storage, jadi dipakai
    // <img> biasa alih-alih next/image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.imageUrl}
      alt={image.altText ?? alt}
      className={imageClassName || undefined}
      loading={eager ? "eager" : "lazy"}
    />
  );
}