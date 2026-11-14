"use client";

import { ReviewCard } from "./reviews-card";
import type { Review } from "./reviews-types";

export type { Review } from "./reviews-types";

/**
 * Marquee ulasan: track berjalan terus ke kiri, berhenti saat hover/fokus/
 * disentuh (CSS `animation-play-state`). Konten digandakan supaya loopnya
 * mulus; salinan kedua disembunyikan dari screen reader dan dari mode
 * reduced-motion (yang jatuh ke track statis yang bisa digeser manual).
 * Durasi mengikuti jumlah ulasan agar kecepatannya konsisten.
 */
export function ReviewsMarquee({
  reviews,
  listLabel,
}: {
  reviews: Review[];
  listLabel: string;
}) {
  const duration = `${Math.max(24, reviews.length * 12)}s`;
  const cards = reviews.map((t) => (
    <li
      key={t.key ?? t.name}
      className="w-[85vw] max-w-[21rem] shrink-0 sm:w-[20rem] md:w-[24rem]"
    >
      <ReviewCard review={t} />
    </li>
  ));

  return (
    <div
      className="kama-marquee mt-8 lg:mt-12"
      style={{ "--kama-marquee-duration": duration } as React.CSSProperties}
    >
      <div className="kama-marquee-track">
        <ul className="flex shrink-0 gap-6 pr-6" aria-label={listLabel}>
          {cards}
        </ul>
        <ul className="kama-marquee-copy flex shrink-0 gap-6 pr-6" aria-hidden="true">
          {cards}
        </ul>
      </div>
    </div>
  );
}
