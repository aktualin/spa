import { BookingBanner, Hero, HeroStats, MembershipBanner } from "@/components/home/hero";
import { CustomSection } from "@/components/home/custom-section";
import { TestimonialsSection, WhatsNewSection } from "@/components/home/sections";
import { SocialsSection } from "@/components/home/socials";
import { SignatureTreatmentsSection } from "@/components/public/home/signature-treatments";
import { PromoHighlightSection } from "@/components/public/home/promo-highlight";
import { GalleryTeaserSection } from "@/components/public/home/gallery-teaser";
import type { HeroSlideRow } from "@/lib/content/homepage";
import type { MembershipProgram } from "@/lib/content/membership";
import type { PageCopy } from "@/lib/content/page-copy";
import type { HighlightCard, ReviewItem, StatItem } from "@/lib/domain/homepage";
import type { VisibleHomeSection } from "./home-order";

/** Data bersama yang dibutuhkan renderer section homepage. */
export type HomeSectionData = {
  membershipProgram: MembershipProgram | null;
  whatsNewCards: HighlightCard[];
  stats: StatItem[];
  reviews: ReviewItem[];
  heroSlides: HeroSlideRow[];
  pageCopy: PageCopy;
  showFooter: boolean;
};

/** Merender satu section homepage sesuai key-nya (lihat `home-order.ts`). */
export function HomeSection({
  entry,
  data,
}: {
  entry: VisibleHomeSection;
  data: HomeSectionData;
}) {
  const { key, section } = entry;
  const { membershipProgram, whatsNewCards, stats, reviews, heroSlides, pageCopy, showFooter } = data;

  switch (key) {
    case "hero":
      return <Hero section={section} copyBlocks={pageCopy} slides={heroSlides} />;
    case "membership-banner":
      return (
        <MembershipBanner
          section={section}
          program={membershipProgram}
          copyBlocks={pageCopy}
        />
      );
    case "whats-new":
      return (
        <WhatsNewSection
          cards={whatsNewCards}
          section={section}
          showNewsletterLink={showFooter}
          copyBlocks={pageCopy}
        />
      );
    case "reviews":
      return (
        <TestimonialsSection
          reviews={reviews}
          section={section}
          copyBlocks={pageCopy}
        />
      );
    case "brand-intro":
      return <HeroStats stats={stats} section={section} copyBlocks={pageCopy} />;
    case "socials":
      return <SocialsSection section={section} copyBlocks={pageCopy} />;
    case "booking-banner":
      return <BookingBanner section={section} copyBlocks={pageCopy} />;
    case "signature-treatments":
      return <SignatureTreatmentsSection section={section} copyBlocks={pageCopy} />;
    case "promo-highlight":
      return <PromoHighlightSection copyBlocks={pageCopy} />;
    case "gallery-teaser":
      return <GalleryTeaserSection section={section} copyBlocks={pageCopy} />;
    default:
      return key.startsWith("custom-") && section ? (
        <CustomSection section={section} />
      ) : null;
  }
}