import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { copy } from "@/lib/content/page-copy";
import type { StatItem } from "@/lib/domain/homepage";
import { clean, safeHref } from "./hero-helpers";
import type { BannerProps } from "./hero-types";

/** `stats` dari `getHomepageStats()`; tabel kosong → daftar kosong. */
export function HeroStats({
  stats,
  section,
  copyBlocks,
}: BannerProps & { stats: StatItem[] }) {
  const eyebrow = clean(section?.eyebrow);
  const title = clean(section?.title);
  const subtitle = clean(section?.subtitle);
  const ctaLabel = clean(section?.ctaLabel);
  const ctaHref = safeHref(section?.ctaHref);
  const statsLabel = copy(copyBlocks, "home.brand_intro.stats_label");

  if (!eyebrow && !title && !subtitle && stats.length === 0) return null;

  return (
    <Reveal as="section" className="bg-gradient-to-r from-cream via-cream-soft to-cocoa/70 text-cocoa">
      <div className="container-kama">
        <div className="grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
          <div className="flex flex-col items-start gap-5">
            {eyebrow ? <p className="text-lead">{eyebrow}</p> : null}
            {title || subtitle ? (
              <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                {title ? <strong>{title}</strong> : null}
                {title && subtitle ? <br /> : null}
                {subtitle ? <em className="font-normal">{subtitle}</em> : null}
              </h2>
            ) : null}
            {ctaLabel && ctaHref ? (
              <Link href={ctaHref} className="btn btn-primary mt-2">
                {ctaLabel}
              </Link>
            ) : null}
          </div>

          <div className="flex flex-col gap-6 lg:items-end">
            {statsLabel ? <p className="text-lead">{statsLabel}</p> : null}
            <dl className="grid w-full grid-cols-3 gap-3 sm:gap-4 lg:justify-items-end">
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  className="flex w-full flex-col items-center gap-3 text-center"
                >
                  <dd className="flex h-20 w-full items-center justify-center bg-white font-display text-[1.75rem] leading-none sm:h-24 sm:text-[2.5rem]">
                    {stat.value}
                  </dd>
                  <dt className="eyebrow text-cocoa/70">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </Reveal>
  );
}