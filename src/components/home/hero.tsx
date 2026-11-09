import Link from "next/link";
import { ArrowRight, ArrowRightThin } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import type { HomepageSection } from "@/lib/content/homepage";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import { isSafeCtaHref, isSafeImageUrl, MOBILE_MEDIA_QUERY } from "@/lib/domain/homepage-banner";
import type { StatItem } from "@/lib/domain/homepage";

/**
 * Hero & banner homepage. Seluruh teks/gambar/tombol berasal dari
 * `HomepageSection` dan `ContentBlock`; tidak ada teks cadangan di kode.
 */

type BannerProps = {
  section?: HomepageSection | null;
  copyBlocks: PageCopy;
};

function clean(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function safeHref(value: string | null | undefined): string | null {
  const href = clean(value);
  return href && isSafeCtaHref(href) ? href : null;
}

function safeImage(value: string | null | undefined): string | null {
  const src = clean(value);
  return src && isSafeImageUrl(src) ? src : null;
}

/**
 * `<img>` biasa, atau `<picture>` dengan `<source>` mobile bila admin mengisi
 * gambar khusus mobile. Tanpa gambar mobile markup-nya tetap satu `<img>`.
 */
function BannerImage({
  src,
  mobileSrc,
  alt,
  className,
  loading,
}: {
  src: string;
  mobileSrc: string | null;
  alt: string;
  className: string;
  loading?: "lazy";
}) {
  const img = <img src={src} loading={loading} alt={alt} className={className} />;
  if (!mobileSrc) return img;
  return (
    <picture>
      <source media={MOBILE_MEDIA_QUERY} srcSet={mobileSrc} />
      {img}
    </picture>
  );
}

export function Hero({ section, copyBlocks }: BannerProps) {
  const title = clean(section?.title);
  const subtitle = clean(section?.subtitle);
  const imageUrl = safeImage(section?.imageUrl);
  const mobileImageUrl = safeImage(section?.mobileImageUrl);
  const imageAlt = clean(section?.imageAlt);
  const ctaLabel = clean(section?.ctaLabel);
  const ctaHref = safeHref(section?.ctaHref);
  const cardEyebrow = copy(copyBlocks, "home.hero.card_eyebrow");
  const cardBody = copy(copyBlocks, "home.hero.card_body");
  const scrollLabel = copy(copyBlocks, "home.hero.scroll_label");
  const showCard = Boolean(cardEyebrow || cardBody || (ctaLabel && ctaHref));

  return (
    <Reveal as="header" className="relative isolate overflow-hidden bg-espresso text-white">
      {/* Background image + overlays */}
      <div className="absolute inset-0 -z-10">
        {imageUrl ? (
          <BannerImage
            src={imageUrl}
            mobileSrc={mobileImageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover"
          />
        ) : null}
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
          </div>

          {/* Membership card — in the flow on mobile, floating card on desktop */}
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
  );
}

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

/** Banner membership; harga berasal dari `MembershipProgram`. */
export function MembershipBanner({
  section,
  program,
  copyBlocks,
}: BannerProps & {
  program?: { priceHeadline: string; bannerBody: string } | null;
}) {
  const title = clean(section?.title);
  const subtitle = clean(section?.subtitle) || clean(program?.bannerBody);
  const imageUrl = safeImage(section?.imageUrl);
  const mobileImageUrl = safeImage(section?.mobileImageUrl);
  const imageAlt = clean(section?.imageAlt);
  const ctaLabel = clean(section?.ctaLabel);
  const ctaHref = safeHref(section?.ctaHref);
  const priceHeadline = clean(program?.priceHeadline);

  if (!title && !subtitle && !ctaLabel) return null;

  return (
    <Reveal as="section" className="bg-cream-soft">
      <div className="container-kama py-12 md:py-16 lg:py-20">
        <div className="grid overflow-hidden bg-cream lg:grid-cols-2">
          {imageUrl ? (
            <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:min-h-[30rem]">
              <BannerImage
                src={imageUrl}
                mobileSrc={mobileImageUrl}
                loading="lazy"
                alt={imageAlt}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="flex flex-col items-center justify-center gap-6 p-8 text-center md:p-12 lg:p-16">
            <h2 className="font-display text-title md:text-[2rem] md:leading-[1.3]">
              {title ? <em>{title}</em> : null}
              {title && priceHeadline ? <br /> : null}
              {priceHeadline}
            </h2>
            {subtitle ? (
              <p className="max-w-[42ch] text-body text-cocoa/75">{subtitle}</p>
            ) : null}
            {ctaLabel && ctaHref ? (
              <Link href={ctaHref} className="btn btn-primary w-full max-w-xs">
                {ctaLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

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
