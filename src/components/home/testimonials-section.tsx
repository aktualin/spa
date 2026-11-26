import { ReviewsMarquee } from "@/components/home/reviews-marquee";
import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import type { HomepageSection } from "@/lib/content/homepage";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { ReviewItem } from "@/lib/domain/homepage";

/**
 * Section Reviews. Judul diambil dari `HomepageSection`; label admin bawaan
 * ("Reviews") kebetulan sama dengan judul tampil, jadi dipakai apa adanya.
 * Tanpa ulasan terbit, seluruh section (termasuk heading) disembunyikan —
 * tidak ada heading yatim atau pesan kosong.
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
  if (reviews.length === 0) return null;
  const eyebrow = section?.eyebrow?.trim() || null;
  const heading = section?.title?.trim() || null;
  const listLabel = copy(copyBlocks, "home.reviews.aria_list") || "Customer reviews";
  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        {eyebrow ? <span className="eyebrow text-cocoa/60">{eyebrow}</span> : null}
        {heading ? (
          <h2 className="font-title italic text-title md:text-[2.375rem] md:leading-[1.2]">
            {heading}
          </h2>
        ) : null}
        {section?.subtitle?.trim() ? (
          <p className="mt-3 max-w-[52ch] text-body text-cocoa/70">{section.subtitle.trim()}</p>
        ) : null}
        <RichText value={section?.bodyHtml} className="mt-3 max-w-[60ch] text-body text-cocoa/70" />

        <ReviewsMarquee reviews={reviews} listLabel={listLabel} />
      </div>
    </Reveal>
  );
}
