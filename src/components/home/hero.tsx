import Link from "next/link";
import { ArrowRightThin } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { HeroSlider } from "@/components/home/hero-slider";
import type { HomepageSection, HeroSlideRow } from "@/lib/content/homepage";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import { isSafeCtaHref, isSafeImageUrl, MOBILE_MEDIA_QUERY } from "@/lib/domain/homepage-banner";
import { resolveHeroSlides } from "@/lib/domain/hero-slide";
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

export function Hero({
  section,
  copyBlocks,
  slides = [],
}: BannerProps & { slides?: HeroSlideRow[] }) {
  const media = resolveHeroSlides(slides, section);
  const labels = {
    cardEyebrow: copy(copyBlocks, "home.hero.card_eyebrow"),
    cardBody: copy(copyBlocks, "home.hero.card_body"),
    scrollLabel: copy(copyBlocks, "home.hero.scroll_label"),
  };

  return <HeroSlider section={section} labels={labels} slides={media} />;
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
