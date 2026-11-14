"use client";

import { useEffect, useRef, useState } from "react";
import type { FocusEvent } from "react";

import { HERO_SLIDE_INTERVAL_MS, type HeroSlideView } from "@/lib/domain/hero-slide";

/**
 * State pemutaran slider hero: autoplay 6 detik yang jeda saat hover, focus,
 * tab tersembunyi, atau prefers-reduced-motion; indeks kembali ke 0 bila
 * jumlah slide menyusut; video aktif diputar, sisanya di-pause.
 */
export function useHeroSlider(slides: HeroSlideView[]) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const slideCount = slides.length;
  const paused = hovered || focused || hidden || reducedMotion;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setHidden(document.hidden);

    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (active >= slideCount) setActive(0);
  }, [active, slideCount]);

  useEffect(() => {
    if (slideCount <= 1 || paused) return;

    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % slideCount);
    }, HERO_SLIDE_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [active, paused, slideCount]);

  useEffect(() => {
    slides.forEach((slide, index) => {
      const video = videoRefs.current[index];
      if (!video) return;

      if (index === active && !reducedMotion && !hidden) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [active, hidden, reducedMotion, slides]);

  /* Jeda autoplay selama pointer/focus berada di dalam hero. */
  const bind = {
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => setHovered(false),
    onFocusCapture: () => setFocused(true),
    onBlurCapture: (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setFocused(false);
      }
    },
  };

  return { active, setActive, videoRefs, slideCount, bind };
}