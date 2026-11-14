"use client";

import { ArrowLeft, ArrowRight } from "@/components/icons";
import type { Review } from "./reviews-types";

const arrowClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-cocoa/25 text-cocoa transition-colors hover:bg-cocoa hover:text-cream-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa disabled:pointer-events-none disabled:opacity-40";

/** Panah navigasi ulasan — menggulirkan track yang sama dengan swipe. */
export function ReviewArrow({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={arrowClass}
      disabled={disabled}
    >
      {direction === "prev" ? (
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      ) : (
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

/** Kartu satu ulasan: kutipan + nama, lokasi, dan peran. */
export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex h-full flex-col bg-cream-soft p-6 md:p-8">
      <blockquote className="text-lead text-cocoa/80">“{review.quote}”</blockquote>
      <div className="mt-6 flex flex-col gap-1">
        <span className="text-[0.9375rem] font-bold">{review.name}</span>
        {review.location ? <span className="text-caption text-cocoa/60">{review.location}</span> : null}
        {review.role ? <span className="eyebrow mt-1 text-cocoa/50">{review.role}</span> : null}
      </div>
    </article>
  );
}