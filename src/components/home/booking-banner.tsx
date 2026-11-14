import Link from "next/link";

import { ArrowRightThin } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { clean, safeHref } from "./hero-helpers";
import type { BannerProps } from "./hero-types";

export function BookingBanner({ section }: BannerProps) {
  const title = clean(section?.title);
  const ctaLabel = clean(section?.ctaLabel);
  const ctaHref = safeHref(section?.ctaHref);

  if (!title && !(ctaLabel && ctaHref)) return null;

  return (
    <Reveal as="section" className="bg-cream-soft">
      <div className="container-kama py-12 md:py-16">
        <div className="flex flex-col items-center gap-6 bg-cream-card px-6 py-10 text-center md:flex-row md:justify-between md:gap-8 md:px-12 md:py-14 md:text-left">
          {title ? (
            <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
              {title}
            </h2>
          ) : null}
          {ctaLabel && ctaHref ? (
            <Link
              href={ctaHref}
              className="btn btn-outline w-full shrink-0 border-cocoa/40 md:w-auto"
            >
              {ctaLabel}
              <ArrowRightThin className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}