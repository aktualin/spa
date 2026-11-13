import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { BookingBanner, Hero, HeroStats, MembershipBanner } from "@/components/home/hero";
import { CustomSection } from "@/components/home/custom-section";
import { TestimonialsSection, WhatsNewSection } from "@/components/home/sections";
import { SocialsSection } from "@/components/home/socials";
import { SignatureTreatmentsSection } from "@/components/public/home/signature-treatments";
import { PromoHighlightSection } from "@/components/public/home/promo-highlight";
import { GalleryTeaserSection } from "@/components/public/home/gallery-teaser";
import {
  getHeroSlides,
  getHomepageReviews,
  getHomepageSections,
  getHomepageStats,
  getWhatsNewCards,
} from "@/lib/content/homepage";
import { getMembershipProgram } from "@/lib/content/membership";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { DEFAULT_DESCRIPTION, DEFAULT_OG_DESCRIPTION, DEFAULT_TITLE } from "@/lib/domain/seo";

/** Bawaan = metadata root; admin bisa menimpanya lewat entri SEO path "/". */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/", {
    title: { absolute: DEFAULT_TITLE },
    description: DEFAULT_DESCRIPTION,
    openGraph: { title: DEFAULT_TITLE, description: DEFAULT_OG_DESCRIPTION },
  });
}

/**
 * Homepage.
 *
 * Section dirender mengikuti `HomepageSection` (admin bisa toggle & mengurutkan).
 * Section yang dinonaktifkan TIDAK dirender sama sekali — bukan disembunyikan
 * dengan CSS. Section baru (signature-treatments, promo-highlight,
 * gallery-teaser) hanya muncul bila barisnya ada di DB dan aktif.
 *
 * Semua teks/gambar/tombol berasal dari DB (`HomepageSection`, `ContentBlock`,
 * `HomepageHighlight`, `HomepageStat`, `HomepageReview`, `InstagramPost`).
 * Tidak ada teks cadangan di kode.
 *
 * Section `footer` hanya mengatur tampil/sembunyi footer di homepage; posisinya
 * tetap di paling bawah (tidak ikut urutan). Tanpa baris DB → tampil.
 */
export default async function Home() {
  const [
    sections,
    membershipProgram,
    whatsNewCards,
    stats,
    reviews,
    heroSlides,
    pageCopy,
  ] = await Promise.all([
    getHomepageSections(),
    getMembershipProgram(),
    getWhatsNewCards(),
    getHomepageStats(),
    getHomepageReviews(),
    getHeroSlides(),
    getPageCopy(),
  ]);

  const showFooter = sections.footer?.isEnabled ?? true;

  const order = [
    "hero",
    "membership-banner",
    "whats-new",
    "reviews",
    "brand-intro",
    "socials",
    "booking-banner",
    "signature-treatments",
    "promo-highlight",
    "gallery-teaser",
    // Section konten bebas buatan admin ikut diurutkan bersama section bawaan.
    ...Object.keys(sections).filter((key) => key.startsWith("custom-")),
  ];

  const visible = order
    .map((key, index) => ({ key, index, section: sections[key] }))
    .filter(({ section }) => !!section && section.isEnabled)
    .sort((a, b) => {
      const diff = (a.section?.sortOrder ?? a.index) - (b.section?.sortOrder ?? b.index);
      return diff !== 0 ? diff : a.index - b.index;
    });

  return (
    <>
      <Navigation />
      <main className="flex-1">
        {/* Satu <h1> per halaman: biasanya dari Hero. Bila admin mematikan
            Hero, judul tetap ada untuk mesin pencari & pembaca layar tanpa
            mengubah tampilan. */}
        {visible.some(({ key }) => key === "hero") ? null : (
          copy(pageCopy, "global.site_title") ? (
            <h1 className="sr-only">{copy(pageCopy, "global.site_title")}</h1>
          ) : null
        )}
        {visible.map(({ key, section }) => {
          switch (key) {
            case "hero":
              return (
                <Hero
                  key={key}
                  section={section}
                  copyBlocks={pageCopy}
                  slides={heroSlides}
                />
              );
            case "membership-banner":
              return <MembershipBanner
                key={key}
                section={section}
                program={membershipProgram}
                copyBlocks={pageCopy}
              />;
            case "whats-new":
              return (
                <WhatsNewSection
                  key={key}
                  cards={whatsNewCards}
                  section={section}
                  showNewsletterLink={showFooter}
                  copyBlocks={pageCopy}
                />
              );
            case "reviews":
              return (
                <TestimonialsSection key={key} reviews={reviews} section={section} />
              );
            case "brand-intro":
              return <HeroStats key={key} stats={stats} section={section} copyBlocks={pageCopy} />;
            case "socials":
              return <SocialsSection key={key} section={section} copyBlocks={pageCopy} />;
            case "booking-banner":
              return <BookingBanner key={key} section={section} copyBlocks={pageCopy} />;
            case "signature-treatments":
              return <SignatureTreatmentsSection key={key} section={section} copyBlocks={pageCopy} />;
            case "promo-highlight":
              return <PromoHighlightSection key={key} copyBlocks={pageCopy} />;
            case "gallery-teaser":
              return <GalleryTeaserSection key={key} section={section} copyBlocks={pageCopy} />;
            default:
              return key.startsWith("custom-") && section ? (
                <CustomSection key={key} section={section} />
              ) : null;
          }
        })}
      </main>
      {showFooter ? <Footer /> : null}
    </>
  );
}
