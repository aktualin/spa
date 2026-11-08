"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "@/components/icons";

export type Review = {
  /** Kunci unik (id baris DB); bila kosong memakai nama. */
  key?: string;
  quote: string;
  name: string;
  location: string;
  role: string;
};

/**
 * The reviews carousel.
 *
 * The track is a native scroll-snap container, so a swipe works on touch
 * devices without any JavaScript. The arrows and the dots are an
 * enhancement for mouse users — they scroll the same track.
 */
export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const scrollToIndex = useCallback((next: number) => {
    const track = trackRef.current;
    if (!track) return;

    const children = Array.from(track.children) as HTMLElement[];
    const target = children[Math.max(0, Math.min(next, children.length - 1))];
    if (!target) return;

    track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  }, []);

  const step = useCallback(
    (direction: -1 | 1) => {
      scrollToIndex(index + direction);
    },
    [index, scrollToIndex],
  );

  /* Keep the dots in sync with the manual scroll of the track. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const children = Array.from(track.children) as HTMLElement[];
        const nearest = children.reduce(
          (best, child, i) =>
            Math.abs(child.offsetLeft - track.scrollLeft) <
            Math.abs(children[best].offsetLeft - track.scrollLeft)
              ? i
              : best,
          0,
        );
        setIndex(nearest);
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="mt-8 lg:mt-12">
      {/* Arrows — desktop and mobile, they scroll the same track. */}
      <div className="mb-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Ulasan sebelumnya"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-cocoa/25 text-cocoa transition-colors hover:bg-cocoa hover:text-cream-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa disabled:pointer-events-none disabled:opacity-40"
          disabled={index === 0}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Ulasan berikutnya"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-cocoa/25 text-cocoa transition-colors hover:bg-cocoa hover:text-cream-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa disabled:pointer-events-none disabled:opacity-40"
          disabled={index >= reviews.length - 1}
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <ul
        ref={trackRef}
        className="kama-reviews-track -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-2 md:-mx-2 md:px-2 lg:gap-8"
        tabIndex={0}
        aria-label="Ulasan pelanggan"
      >
        {reviews.map((t) => (
          <li
            key={t.key ?? t.name}
            className="w-[85%] shrink-0 snap-start md:w-[48%] lg:w-[31.5%]"
          >
            <article className="flex h-full flex-col bg-cream-soft p-6 md:p-8">
              <blockquote className="text-lead text-cocoa/80">“{t.quote}”</blockquote>
              <div className="mt-6 flex flex-col gap-1">
                <span className="text-[0.9375rem] font-bold">{t.name}</span>
                {t.location ? <span className="text-caption text-cocoa/60">{t.location}</span> : null}
                {t.role ? <span className="eyebrow mt-1 text-cocoa/50">{t.role}</span> : null}
              </div>
            </article>
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
            aria-label={`Ke ulasan ${t.name}`}
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
