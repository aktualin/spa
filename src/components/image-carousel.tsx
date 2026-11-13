"use client";

import { useRef, useState } from "react";

export type CarouselImage = { imageUrl: string; altText: string | null };

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`size-4 ${direction === "left" ? "" : "rotate-180"}`}
    >
      <path
        d="M10 3 5 8l5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
}: {
  images: CarouselImage[];
  /** Alt fallback untuk gambar yang tidak punya altText sendiri. */
  alt: string;
  /** Kelas pembungkus carousel (tidak dipakai untuk mode satu gambar). */
  className?: string;
  /** Kelas tiap <img>, mis. "image-cover" agar menyatu dengan CSS halaman. */
  imageClassName?: string;
  eager?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      // Sumbernya URL eksternal arbitrer dari Supabase Storage, jadi dipakai
      // <img> biasa alih-alih next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={images[0].imageUrl}
        alt={images[0].altText ?? alt}
        className={imageClassName || undefined}
        loading={eager ? "eager" : "lazy"}
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

  const arrowClass =
    "absolute top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-white/85 text-neutral-800 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100 hover:bg-white disabled:pointer-events-none disabled:opacity-0";

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

      <button
        type="button"
        aria-label="Gambar sebelumnya"
        disabled={index === 0}
        onClick={() => scrollTo(index - 1)}
        className={`${arrowClass} left-3`}
      >
        <Chevron direction="left" />
      </button>
      <button
        type="button"
        aria-label="Gambar berikutnya"
        disabled={index === images.length - 1}
        onClick={() => scrollTo(index + 1)}
        className={`${arrowClass} right-3`}
      >
        <Chevron direction="right" />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {images.map((image, i) => (
          <button
            key={`${image.imageUrl}-dot-${i}`}
            type="button"
            aria-label={`Gambar ${i + 1} dari ${images.length}`}
            aria-current={i === index}
            onClick={() => scrollTo(i)}
            className={`size-2 rounded-full transition-colors ${
              i === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
