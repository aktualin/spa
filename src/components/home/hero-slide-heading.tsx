import Link from "next/link";

import { ArrowRightThin } from "@/components/icons";

/** Lockup brand + eyebrow menu + judul + panah scroll di tengah hero. */
export function HeroSlideHeading({
  lockupUrl,
  lockupAlt,
  subtitle,
  title,
  scrollLabel,
  menuHref,
}: {
  lockupUrl: string;
  lockupAlt: string;
  subtitle: string;
  title: string;
  scrollLabel: string;
  menuHref: string;
}) {
  return (
    <>
      {/* Lockup brand — momen logo utama di atas judul hero. */}
      <img
        src={lockupUrl}
        alt={lockupAlt}
        fetchPriority="high"
        className="mb-7 h-11 w-auto md:mb-9 md:h-14"
      />

      {subtitle ? (
        <h2 className="eyebrow text-white/85">
          <Link href={menuHref} className="transition-opacity hover:opacity-70">
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
    </>
  );
}