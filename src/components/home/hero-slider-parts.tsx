import Link from "next/link";

import { fillCopy } from "@/components/copy-text";
import { ArrowRight } from "@/components/icons";
import type { HeroSlideView } from "@/lib/domain/hero-slide";

/** Titik navigasi slide; hanya dirender bila slide lebih dari satu. */
export function HeroSlideDots({
  slides,
  active,
  onSelect,
  groupAria,
  dotAria,
}: {
  slides: HeroSlideView[];
  active: number;
  onSelect: (index: number) => void;
  groupAria: string;
  dotAria: string;
}) {
  return (
    <div
      className="mt-6 flex items-center justify-center gap-1"
      role="group"
      aria-label={groupAria}
    >
      {slides.map((slide, index) => (
        <button
          key={slide.key}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={fillCopy(dotAria, { n: index + 1, m: slides.length })}
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
  );
}

/** Kartu putih di kanan bawah hero: eyebrow, body, dan CTA menuju menu. */
export function HeroSlideCard({
  eyebrow,
  body,
  ctaLabel,
  ctaHref,
  menuHref,
}: {
  eyebrow: string;
  body: string;
  ctaLabel: string;
  ctaHref: string | null;
  menuHref: string;
}) {
  return (
    <div className="mt-10 w-full lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:w-[24rem]">
      <div className="bg-white p-6 text-cocoa shadow-lg shadow-black/10 lg:py-7">
        <div className="flex flex-col gap-2">
          {eyebrow ? (
            <span className="eyebrow text-cocoa/70">
              <Link href={menuHref} className="hover:opacity-70">
                {eyebrow}
              </Link>
            </span>
          ) : null}
          {body ? (
            <p className="text-lead text-cocoa/80">
              <Link href={menuHref}>{body}</Link>
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
  );
}