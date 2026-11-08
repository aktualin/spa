import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { BookingBanner, Hero, HeroStats, MembershipBanner } from "@/components/home/hero";
import { TestimonialsSection, WhatsNewSection } from "@/components/home/sections";
import { SocialsSection } from "@/components/home/socials";
import { SignatureTreatmentsSection } from "@/components/public/home/signature-treatments";
import { PromoHighlightSection } from "@/components/public/home/promo-highlight";
import { GalleryTeaserSection } from "@/components/public/home/gallery-teaser";
import { getHomepageSections, getWhatsNewCards } from "@/lib/content/homepage";
import { getMembershipProgram } from "@/lib/content/membership";

/**
 * Homepage.
 *
 * Section dirender mengikuti `HomepageSection` (admin bisa toggle & mengurutkan).
 * Section yang dinonaktifkan TIDAK dirender sama sekali — bukan disembunyikan
 * dengan CSS. Section baru (signature-treatments, promo-highlight,
 * gallery-teaser) hanya muncul bila barisnya ada di DB dan aktif.
 *
 * Hero, banner membership, dan banner booking menerima data section-nya
 * (gambar, teks, tombol); isian kosong memakai teks/gambar bawaan.
 *
 * "What's New" menampilkan kartu highlight dari admin (`HomepageHighlight`),
 * atau kartu statis lama bila tabel highlight kosong.
 *
 * Section `footer` hanya mengatur tampil/sembunyi footer di homepage; posisinya
 * tetap di paling bawah (tidak ikut urutan). Tanpa baris DB → tampil.
 */
export default async function Home() {
  const [sections, membershipProgram, whatsNewCards] = await Promise.all([
    getHomepageSections(),
    getMembershipProgram(),
    getWhatsNewCards(),
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
        {visible.map(({ key, section }) => {
          switch (key) {
            case "hero":
              return <Hero key={key} section={section} />;
            case "membership-banner":
              return <MembershipBanner key={key} section={section} program={membershipProgram} />;
            case "whats-new":
              return (
                <WhatsNewSection
                  key={key}
                  cards={whatsNewCards}
                  showNewsletterLink={showFooter}
                />
              );
            case "reviews":
              return <TestimonialsSection key={key} />;
            case "brand-intro":
              return <HeroStats key={key} />;
            case "socials":
              return <SocialsSection key={key} />;
            case "booking-banner":
              return <BookingBanner key={key} section={section} />;
            case "signature-treatments":
              return <SignatureTreatmentsSection key={key} />;
            case "promo-highlight":
              return <PromoHighlightSection key={key} />;
            case "gallery-teaser":
              return <GalleryTeaserSection key={key} />;
            default:
              return null;
          }
        })}
      </main>
      {showFooter ? <Footer /> : null}
    </>
  );
}
