import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
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
import { visibleHomeSections } from "./home-order";
import { HomeSection } from "./home-sections";

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
  const visible = visibleHomeSections(sections);
  const data = {
    membershipProgram,
    whatsNewCards,
    stats,
    reviews,
    heroSlides,
    pageCopy,
    showFooter,
  };

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
        {visible.map((entry) => (
          <HomeSection key={entry.key} entry={entry} data={data} />
        ))}
      </main>
      {showFooter ? <Footer /> : null}
    </>
  );
}