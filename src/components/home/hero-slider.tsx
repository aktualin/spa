"use client";

import { Reveal } from "@/components/reveal";
import { clean, safeHref } from "./hero-helpers";
import { HeroSlideHeading } from "./hero-slide-heading";
import { HeroSlideMedia } from "./hero-slide-media";
import { useHeroSlider } from "./hero-slider-hooks";
import { HeroSlideCard, HeroSlideDots } from "./hero-slider-parts";
import type { HeroSliderProps } from "./hero-types";

export function HeroSlider({ section, labels, slides }: HeroSliderProps) {
  const { active, setActive, videoRefs, slideCount, bind } = useHeroSlider(slides);

  const title = clean(section?.title);
  const subtitle = clean(section?.subtitle);
  const ctaLabel = clean(section?.ctaLabel);
  const ctaHref = safeHref(section?.ctaHref);
  const showCard = Boolean(labels.cardEyebrow || labels.cardBody || (ctaLabel && ctaHref));

  return (
    <div className="relative isolate overflow-hidden bg-espresso text-white" {...bind}>
      <Reveal as="header" className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {slides.map((slide, index) => (
            <HeroSlideMedia
              key={slide.key}
              slide={slide}
              index={index}
              active={index === active}
              videoRef={(node) => {
                videoRefs.current[index] = node;
              }}
            />
          ))}

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
              <HeroSlideHeading
                lockupUrl={labels.lockupUrl}
                lockupAlt={labels.lockupAlt}
                subtitle={subtitle}
                title={title}
                scrollLabel={labels.scrollLabel}
                menuHref={labels.menuHref}
              />

              {slideCount > 1 ? (
                <HeroSlideDots
                  slides={slides}
                  active={active}
                  onSelect={setActive}
                  groupAria={labels.sliderAria}
                  dotAria={labels.dotAria}
                />
              ) : null}
            </div>

            {showCard ? (
              <HeroSlideCard
                eyebrow={labels.cardEyebrow}
                body={labels.cardBody}
                ctaLabel={ctaLabel}
                ctaHref={ctaHref}
                menuHref={labels.menuHref}
              />
            ) : null}
          </div>
        </div>
      </Reveal>
    </div>
  );
}