import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { MOBILE_MEDIA_QUERY } from "@/lib/domain/homepage-banner";
import { clean, safeHref, safeImage } from "./hero-helpers";
import type { BannerProps } from "./hero-types";

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