import Link from "next/link";
import { ArrowRight, ArrowRightThin } from "@/components/icons";
import { membership } from "@/data/content";
import { Reveal } from "@/components/reveal";
import type { HomepageSection } from "@/lib/content/homepage";
import type { StatItem } from "@/lib/domain/homepage";
import {
  BOOKING_BANNER_DEFAULTS,
  HERO_DEFAULTS,
  MOBILE_MEDIA_QUERY,
  resolveBanner,
  type BannerDefaults,
} from "@/lib/domain/homepage-banner";

/**
 * Hero & banner homepage. Teks/gambar/tombol bisa diatur admin
 * (`/admin/homepage`); field kosong memakai nilai bawaan lewat `resolveBanner`
 * sehingga tanpa isian admin markup-nya identik dengan versi hardcode lama.
 * Judul section di DB yang masih berupa label admin ("Hero", dsb.) TIDAK
 * ditampilkan — lihat `isPlaceholderTitle` di `@/lib/domain/homepage-banner`.
 */

type BannerProps = { section?: HomepageSection | null };

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

export function Hero({ section }: BannerProps = {}) {
  const hero = resolveBanner(section, HERO_DEFAULTS);
  return (
    <Reveal as="header" className="relative isolate overflow-hidden bg-espresso text-white">
      {/* Background image + overlays */}
      <div className="absolute inset-0 -z-10">
        <BannerImage
          src={hero.imageUrl}
          mobileSrc={hero.mobileImageUrl}
          alt={hero.imageAlt}
          className="h-full w-full object-cover"
        />
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
            <h2 className="eyebrow text-white/85">
              <Link href="/menu" className="transition-opacity hover:opacity-70">
                {hero.subtitle}
              </Link>
            </h2>

            <h1 className="mt-6 font-display text-display font-normal md:text-[2.75rem] lg:text-[4.1875rem] lg:leading-[1.1]">
              {hero.title}
            </h1>

            <a
              href="#home_whats_new"
              aria-label="See what's new"
              className="mt-8 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/50 transition-colors hover:bg-white hover:text-cocoa"
            >
              <ArrowRightThin className="h-4 w-4 rotate-90" />
            </a>
          </div>

          {/* Membership card — in the flow on mobile, floating card on desktop */}
          <div className="mt-10 w-full lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:w-[24rem]">
            <div className="bg-white p-6 text-cocoa shadow-lg shadow-black/10 lg:py-7">
              <div className="flex flex-col gap-2">
                <span className="eyebrow text-cocoa/70">
                  <Link href="/menu" className="hover:opacity-70">
                    Welcome to KAMA Spa
                  </Link>
                </span>
                <p className="text-lead text-cocoa/80">
                  <Link href="/menu">
                    Your premier destination for massage and wellness services in South
                    Jakarta. Joyful rejuvenation awaits.
                  </Link>
                </p>
              </div>
              <Link
                href={hero.ctaHref}
                className="mt-5 inline-flex items-center gap-2 text-[0.9375rem] transition-opacity hover:opacity-70"
              >
                {hero.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/** `stats` dari `getHomepageStats()` (statistik admin, atau bawaan bila kosong). */
export function HeroStats({ stats }: { stats: StatItem[] }) {
  return (
    <Reveal as="section" className="bg-gradient-to-r from-cream via-cream-soft to-cocoa/70 text-cocoa">
      <div className="container-kama">
        <div className="grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
          <div className="flex flex-col items-start gap-5">
            <p className="text-lead">A sanctuary in the heart of South Jakarta</p>
            <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
              <strong>More than relaxation</strong>
              <br />
              <em className="font-normal">we create meaningful reset experiences.</em>
            </h2>
            <Link href="/corporate" className="btn btn-primary mt-2">
              Our Story
            </Link>
          </div>

          <div className="flex flex-col gap-6 lg:items-end">
            <p className="text-lead">KAMA at a glance</p>
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

/** Dipakai juga sebagai placeholder di form admin. */
export const MEMBERSHIP_BANNER_DEFAULTS: BannerDefaults = {
  title: membership.title,
  subtitle: membership.body,
  imageUrl: "/img/kama/07-flower-bowl.jpg",
  imageAlt: "KAMA Spa treatment room",
  ctaLabel: membership.cta,
  ctaHref: membership.href,
};

/**
 * Kalimat harga dan deskripsi bawaan diambil dari program membership (modul
 * Membership); isian banner di modul Homepage tetap menang bila diisi.
 */
export function MembershipBanner({
  section,
  program,
}: BannerProps & {
  program?: { priceHeadline: string; bannerBody: string } | null;
} = {}) {
  const banner = resolveBanner(section, {
    ...MEMBERSHIP_BANNER_DEFAULTS,
    subtitle: program?.bannerBody || MEMBERSHIP_BANNER_DEFAULTS.subtitle,
  });
  const priceHeadline = program?.priceHeadline || membership.price;
  return (
    <Reveal as="section" className="bg-cream-soft">
      <div className="container-kama py-12 md:py-16 lg:py-20">
        <div className="grid overflow-hidden bg-cream lg:grid-cols-2">
          <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:min-h-[30rem]">
            <BannerImage
              src={banner.imageUrl}
              mobileSrc={banner.mobileImageUrl}
              loading="lazy"
              alt={banner.imageAlt}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-6 p-8 text-center md:p-12 lg:p-16">
            <h2 className="font-display text-title md:text-[2rem] md:leading-[1.3]">
              <em>{banner.title}</em>
              <br />
              {priceHeadline}
            </h2>
            <p className="max-w-[42ch] text-body text-cocoa/75">{banner.subtitle}</p>
            <Link href={banner.ctaHref} className="btn btn-primary w-full max-w-xs">
              {banner.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function BookingBanner({ section }: BannerProps = {}) {
  const banner = resolveBanner(section, BOOKING_BANNER_DEFAULTS);
  return (
    <Reveal as="section" className="bg-cream-soft">
      <div className="container-kama py-12 md:py-16">
        <div className="flex flex-col items-center gap-6 bg-cream-card px-6 py-10 text-center md:flex-row md:justify-between md:gap-8 md:px-12 md:py-14 md:text-left">
          <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
            {banner.title}
          </h2>
          <Link
            href={banner.ctaHref}
            className="btn btn-outline w-full shrink-0 border-cocoa/40 md:w-auto"
          >
            {banner.ctaLabel}
            <ArrowRightThin className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
