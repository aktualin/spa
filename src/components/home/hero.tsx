import { HeroSlider } from "@/components/home/hero-slider";
import type { HeroSlideRow } from "@/lib/content/homepage";
import { copy } from "@/lib/content/page-copy";
import { getSiteSettings } from "@/lib/content/site";
import { asset } from "@/lib/asset-url";
import { resolveHeroSlides } from "@/lib/domain/hero-slide";
import { safeHref } from "./hero-helpers";
import type { BannerProps } from "./hero-types";

export { HeroStats } from "./hero-stats";
export { MembershipBanner } from "./membership-banner";
export { BookingBanner } from "./booking-banner";

/**
 * Hero & banner homepage. Seluruh teks/gambar/tombol berasal dari
 * `HomepageSection` dan `ContentBlock`; tidak ada teks cadangan di kode.
 */
export async function Hero({
  section,
  copyBlocks,
  slides = [],
}: BannerProps & { slides?: HeroSlideRow[] }) {
  const settings = await getSiteSettings();
  const media = resolveHeroSlides(slides, section);
  const labels = {
    cardEyebrow: copy(copyBlocks, "home.hero.card_eyebrow"),
    cardBody: copy(copyBlocks, "home.hero.card_body"),
    scrollLabel: copy(copyBlocks, "home.hero.scroll_label"),
    lockupUrl: settings.logoLockupUrl || asset("img/kama/logo-kama-light.png"),
    lockupAlt: settings.brandLogoAlt || "KAMA Spa",
    menuHref: safeHref(copy(copyBlocks, "home.hero.menu_href")) ?? "/menu",
    sliderAria: copy(copyBlocks, "home.hero.slider_aria") || "Pilih visual hero",
    dotAria:
      copy(copyBlocks, "home.hero.dot_aria") || "Tampilkan visual {n} dari {m}",
  };

  return <HeroSlider section={section} labels={labels} slides={media} />;
}