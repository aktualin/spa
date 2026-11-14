"use client";

import type { Review } from "./reviews-types";

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
