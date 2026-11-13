"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ArrowRight, ArrowRightThin } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import type { HomepageSection } from "@/lib/content/homepage";
import type { HeroSlideView } from "@/lib/domain/hero-slide";
import { HERO_SLIDE_INTERVAL_MS } from "@/lib/domain/hero-slide";
import { isSafeCtaHref, MOBILE_MEDIA_QUERY } from "@/lib/domain/homepage-banner";
import { asset } from "@/lib/asset-url";

type HeroSliderLabels = {
  cardEyebrow: string;
  cardBody: string;
  scrollLabel: string;
};

type HeroSliderProps = {
  section?: HomepageSection | null;
  labels: HeroSliderLabels;
  slides: HeroSlideView[];
};

function clean(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function safeHref(value: string | null | undefined): string | null {
  const href = clean(value);
  return href && isSafeCtaHref(href) ? href : null;
}

function videoType(url: string): string {
  return /\.webm(?:[?#]|$)/i.test(url) ? "video/webm" : "video/mp4";
}

export function HeroSlider({ section, labels, slides }: HeroSliderProps) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  const title = clean(section?.title);
  const subtitle = clean(section?.subtitle);
  const ctaLabel = clean(section?.ctaLabel);
  const ctaHref = safeHref(section?.ctaHref);
  const cardEyebrow = labels.cardEyebrow;
  const cardBody = labels.cardBody;
  const scrollLabel = labels.scrollLabel;
  const showCard = Boolean(cardEyebrow || cardBody || (ctaLabel && ctaHref));
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

  return (
    <div
      className="relative isolate overflow-hidden bg-espresso text-white"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
    >
      <Reveal as="header" className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {slides.map((slide, index) => {
            const isActive = index === active;

            return (
              <div
                key={slide.key}
                data-hero-slide={index}
                data-active={isActive ? "true" : "false"}
                className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={isActive ? undefined : true}
              >
                {slide.mediaType === "VIDEO" && slide.videoUrl ? (
                  <video
                    ref={(node) => {
                      videoRefs.current[index] = node;
                    }}
                    className="h-full w-full object-cover"
                    muted
                    loop
                    playsInline
                    preload={index === 0 ? "metadata" : "none"}
                    poster={slide.imageUrl}
                    tabIndex={-1}
                    aria-label={slide.imageAlt || undefined}
                    disablePictureInPicture
                  >
                    <source src={slide.videoUrl} type={videoType(slide.videoUrl)} />
                  </video>
                ) : (
                  <picture>
                    {slide.mobileImageUrl ? (
                      <source media={MOBILE_MEDIA_QUERY} srcSet={slide.mobileImageUrl} />
                    ) : null}
                    <img
                      src={slide.imageUrl}
                      alt={slide.imageAlt}
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      className="h-full w-full object-cover"
                    />
                  </picture>
                )}
              </div>
            );
          })}

          <div className="absolute inset-0 bg-espresso/45" />
          <div
            className="absolute -left-1/4 top-1/4 -z-10 h-[28rem] w-[28rem] rounded-full bg-caramel/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -right-1/4 -top-1/4 -z-10 h-[34rem] w-[34rem] rounded-full bg-cocoa/50 blur-3xl"
            aria-hidden="true"
          />
        </div>

        <div className="container-kama relative">
          <div className="relative flex min-h-[92svh] flex-col items-center justify-center pb-12 pt-28 text-center lg:pb-44 lg:pt-36">
            <div className="flex max-w-[52rem] flex-col items-center">
              {/* Lockup brand — momen logo utama di atas judul hero. */}
              <img
                src={asset("img/kama/logo-kama-light.png")}
                alt="KAMA Spa"
                fetchPriority="high"
                className="mb-7 h-11 w-auto md:mb-9 md:h-14"
              />

              {subtitle ? (
                <h2 className="eyebrow text-white/85">
                  <Link href="/menu" className="transition-opacity hover:opacity-70">
                    {subtitle}
                  </Link>
                </h2>
              ) : null}

              {title ? (
                <h1 className="mt-6 font-display text-display font-normal md:text-[2.75rem] lg:text-[4.1875rem] lg:leading-[1.1]">
                  {title}
                </h1>
              ) : null}

              {scrollLabel ? (
                <a
                  href="#home_whats_new"
                  aria-label={scrollLabel}
                  className="mt-8 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/50 transition-colors hover:bg-white hover:text-cocoa"
                >
                  <ArrowRightThin className="h-4 w-4 rotate-90" />
                </a>
              ) : null}

              {slideCount > 1 ? (
                <div
                  className="mt-6 flex items-center justify-center gap-1"
                  role="group"
                  aria-label="Pilih visual hero"
                >
                  {slides.map((slide, index) => (
                    <button
                      key={slide.key}
                      type="button"
                      onClick={() => setActive(index)}
                      aria-label={`Tampilkan visual ${index + 1} dari ${slideCount}`}
                      aria-current={index === active ? "true" : undefined}
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                    >
                      <span
                        className={`block h-2 w-2 rounded-full transition-colors ${
                          index === active ? "bg-white" : "bg-white/40"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {showCard ? (
              <div className="mt-10 w-full lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:w-[24rem]">
                <div className="bg-white p-6 text-cocoa shadow-lg shadow-black/10 lg:py-7">
                  <div className="flex flex-col gap-2">
                    {cardEyebrow ? (
                      <span className="eyebrow text-cocoa/70">
                        <Link href="/menu" className="hover:opacity-70">
                          {cardEyebrow}
                        </Link>
                      </span>
                    ) : null}
                    {cardBody ? (
                      <p className="text-lead text-cocoa/80">
                        <Link href="/menu">{cardBody}</Link>
                      </p>
                    ) : null}
                  </div>
                  {ctaLabel && ctaHref ? (
                    <Link
                      href={ctaHref}
                      className="mt-5 inline-flex items-center gap-2 text-[0.9375rem] transition-opacity hover:opacity-70"
                    >
                      {ctaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
