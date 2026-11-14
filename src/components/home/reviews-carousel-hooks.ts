"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Track scroll-snap ulasan: indeks aktif mengikuti scroll manual supaya
 * dots tetap sinkron; scrollToIndex menggulir ke kartu tujuan secara smooth.
 */
export function useReviewsTrack() {
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

  return { trackRef, index, scrollToIndex, step };
}