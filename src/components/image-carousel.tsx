"use client";

import { useRef, useState } from "react";

import { CarouselArrow, CarouselDots } from "./image-carousel-parts";
import { CarouselSingleImage } from "./image-carousel-single";
import type { CarouselLabels, ImageCarouselProps } from "./image-carousel-types";

export type { CarouselImage, CarouselLabels } from "./image-carousel-types";

const DEFAULT_LABELS: CarouselLabels = {
  prev: "Gambar sebelumnya",
  next: "Gambar berikutnya",
  counter: "Gambar {n} dari {m}",
};

/**
 * Renderer gambar konten: tepat satu gambar → <img> biasa (markup identik
 * dengan sebelum ada carousel); lebih dari satu → carousel scroll-snap dengan
 * panah + dot. Tidak ada autoplay — pergerakan hanya karena aksi pengguna
 * (klik/geser), dan scroll programatik menghormati prefers-reduced-motion.
 */
export function ImageCarousel({
  images,
  alt,
  className = "",
  imageClassName = "",
  eager = false,
  labels = DEFAULT_LABELS,
}: ImageCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <CarouselSingleImage
        image={images[0]}
        alt={alt}
        imageClassName={imageClassName}
        eager={eager}
      />
    );
  }

  function scrollTo(next: number) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(images.length - 1, next));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: clamped * track.clientWidth,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  return (
    <div className={`group relative h-full w-full overflow-hidden ${className}`}>
      <div
        ref={trackRef}
        onScroll={(event) => {
          const track = event.currentTarget;
          setIndex(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
        }}
        className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${image.imageUrl}-${i}`}
            src={image.imageUrl}
            alt={image.altText ?? alt}
            className={`min-w-full shrink-0 snap-start ${imageClassName}`}
            loading={eager && i === 0 ? "eager" : "lazy"}
            draggable={false}
          />
        ))}
      </div>

      <CarouselArrow
        direction="left"
        label={labels.prev}
        disabled={index === 0}
        onClick={() => scrollTo(index - 1)}
      />
      <CarouselArrow
        direction="right"
        label={labels.next}
        disabled={index === images.length - 1}
        onClick={() => scrollTo(index + 1)}
      />
      <CarouselDots images={images} index={index} counterLabel={labels.counter} onSelect={scrollTo} />
    </div>
  );
}