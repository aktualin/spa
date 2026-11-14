"use client";

import { fillCopy } from "@/components/copy-text";
import type { CarouselImage } from "./image-carousel-types";

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

const arrowClass =
  "absolute top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-white/85 text-neutral-800 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100 hover:bg-white disabled:pointer-events-none disabled:opacity-0";

/** Panah kiri/kanan carousel; tampil saat hover/focus (selalu di mobile). */
export function CarouselArrow({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`${arrowClass} ${direction === "left" ? "left-3" : "right-3"}`}
    >
      <Chevron direction={direction} />
    </button>
  );
}

/** Dot posisi gambar; counter memakai placeholder {n}/{m}. */
export function CarouselDots({
  images,
  index,
  counterLabel,
  onSelect,
}: {
  images: CarouselImage[];
  index: number;
  counterLabel: string;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
      {images.map((image, i) => (
        <button
          key={`${image.imageUrl}-dot-${i}`}
          type="button"
          aria-label={fillCopy(counterLabel, { n: i + 1, m: images.length })}
          aria-current={i === index}
          onClick={() => onSelect(i)}
          className={`size-2 rounded-full transition-colors ${
            i === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
          }`}
        />
      ))}
    </div>
  );
}