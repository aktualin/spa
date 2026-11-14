"use client";

import { fillCopy } from "@/components/copy-text";
import { useReviewsTrack } from "./reviews-carousel-hooks";
import { ReviewArrow, ReviewCard } from "./reviews-carousel-parts";
import type { Review, ReviewsLabels } from "./reviews-types";

export type { Review, ReviewsLabels } from "./reviews-types";

const DEFAULT_LABELS: ReviewsLabels = {
  prev: "Ulasan sebelumnya",
  next: "Ulasan berikutnya",
  list: "Ulasan pelanggan",
  dot: "Ke ulasan {name}",
};

/**
 * The reviews carousel.
 *
 * The track is a native scroll-snap container, so a swipe works on touch
 * devices without any JavaScript. The arrows and the dots are an
 * enhancement for mouse users — they scroll the same track.
 */
export function ReviewsCarousel({
  reviews,
  labels = DEFAULT_LABELS,
}: {
  reviews: Review[];
  labels?: ReviewsLabels;
}) {
  const { trackRef, index, scrollToIndex, step } = useReviewsTrack();

  return (
    <div className="mt-8 lg:mt-12">
      {/* Arrows — desktop and mobile, they scroll the same track. */}
      <div className="mb-5 flex items-center justify-end gap-2">
        <ReviewArrow
          direction="prev"
          label={labels.prev}
          disabled={index === 0}
          onClick={() => step(-1)}
        />
        <ReviewArrow
          direction="next"
          label={labels.next}
          disabled={index >= reviews.length - 1}
          onClick={() => step(1)}
        />
      </div>

      <ul
        ref={trackRef}
        className="kama-reviews-track -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-2 md:-mx-2 md:px-2 lg:gap-8"
        tabIndex={0}
        aria-label={labels.list}
      >
        {reviews.map((t) => (
          <li
            key={t.key ?? t.name}
            className="w-[85%] shrink-0 snap-start md:w-[48%] lg:w-[31.5%]"
          >
            <ReviewCard review={t} />
          </li>
        ))}
      </ul>

      {/* Dots */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {reviews.map((t, i) => (
          <button
            key={t.key ?? t.name}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={fillCopy(labels.dot, { name: t.name })}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-cocoa" : "w-2 bg-cocoa/25 hover:bg-cocoa/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}