"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Indeks lightbox + navigasi keyboard: Esc menutup, ← foto sebelumnya,
 * → foto berikutnya (wrap-around di kedua ujung).
 */
export function useLightboxIndex(count: number, initialIndex: number | null) {
  const [index, setIndex] = useState<number | null>(initialIndex);

  const close = useCallback(() => setIndex(null), []);
  const previous = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + count) % count)),
    [count],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % count)),
    [count],
  );

  useEffect(() => {
    if (index === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [index, close, previous, next]);

  return { index, close, previous, next };
}