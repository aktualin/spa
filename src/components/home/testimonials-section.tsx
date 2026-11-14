import { ReviewsCarousel } from "@/components/home/reviews-carousel";
import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import type { HomepageSection } from "@/lib/content/homepage";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { ReviewItem } from "@/lib/domain/homepage";

/**
 * Section Reviews. Judul diambil dari `HomepageSection`; label admin bawaan
 * ("Reviews") kebetulan sama dengan judul tampil, jadi dipakai apa adanya.
 * Tanpa ulasan terbit, pesan kosong CB home.reviews.empty ditampilkan bila
 * diisi; bila kosong juga, section disembunyikan (bukan terlihat rusak).
 */
export function TestimonialsSection({
  reviews,
  section,
  copyBlocks,
}: {
  reviews: ReviewItem[];
  section?: HomepageSection | null;
  copyBlocks: PageCopy;
}) {
  const emptyText = copy(copyBlocks, "home.reviews.empty");
  if (reviews.length === 0 && !emptyText) return null;
  const eyebrow = section?.eyebrow?.trim() || null;
  const heading = section?.title?.trim() || null;
  const reviewLabels = {
    prev: copy(copyBlocks, "home.reviews.aria_prev") || "Ulasan sebelumnya",
    next: copy(copyBlocks, "home.reviews.aria_next") || "Ulasan berikutnya",
    list: copy(copyBlocks, "home.reviews.aria_list") || "Ulasan pelanggan",
    dot: copy(copyBlocks, "home.reviews.dot_aria") || "Ke ulasan {name}",
  };
  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        {eyebrow ? <span className="eyebrow text-cocoa/60">{eyebrow}</span> : null}
        {heading ? (
          <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
            {heading}
          </h2>
        ) : null}
        {section?.subtitle?.trim() ? (
          <p className="mt-3 max-w-[52ch] text-body text-cocoa/70">{section.subtitle.trim()}</p>
        ) : null}
        <RichText value={section?.bodyHtml} className="mt-3 max-w-[60ch] text-body text-cocoa/70" />

        {reviews.length > 0 ? (
          <ReviewsCarousel reviews={reviews} labels={reviewLabels} />
        ) : (
          <p className="mt-8 text-body text-cocoa/60">{emptyText}</p>
        )}
      </div>
    </Reveal>
  );
}