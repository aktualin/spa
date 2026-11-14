import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import type { HomepageSection } from "@/lib/content/homepage";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import { isSafeCtaHref } from "@/lib/domain/homepage-banner";
import type { HighlightCard } from "@/lib/domain/homepage";
import { WhatsNewCardBody } from "./whats-new-card";

export { TestimonialsSection } from "./testimonials-section";

/**
 * Section "What's New". Judul, deskripsi, dan tombol diambil dari
 * `HomepageSection` (modul Homepage); bagian yang belum diisi admin tidak
 * dirender, bukan diganti teks bawaan.
 *
 * `cards` berasal dari `getWhatsNewCards()` (modul Highlight Homepage).
 * Tombol ajakan biasanya menuju `#footer`, jadi disembunyikan bila footer
 * homepage dimatikan admin (`showNewsletterLink = false`).
 */
export function WhatsNewSection({
  cards,
  section,
  showNewsletterLink = true,
  copyBlocks,
}: {
  cards: HighlightCard[];
  section?: HomepageSection | null;
  showNewsletterLink?: boolean;
  copyBlocks: PageCopy;
}) {
  const eyebrow = section?.eyebrow?.trim() || null;
  const heading = section?.title?.trim() || null;
  const description = section?.subtitle?.trim() || null;
  const ctaLabel = section?.ctaLabel?.trim() || null;
  const ctaHref = section?.ctaHref?.trim() || null;
  const defaultEyebrow = copy(copyBlocks, "home.whats_new.card_eyebrow");
  const defaultCtaLabel = copy(copyBlocks, "home.whats_new.cta_fallback");
  const emptyText = copy(copyBlocks, "home.whats_new.empty");
  // Tautan hanya dipakai bila tujuannya aman (pertahanan bila DB diisi di
  // luar admin), dan tombolnya ikut disembunyikan saat footer dimatikan.
  const showCta =
    showNewsletterLink && ctaLabel && ctaHref && isSafeCtaHref(ctaHref);

  return (
    <Reveal
      as="section"
      id="home_whats_new"
      className="scroll-mt-[calc(var(--kama-header-h)+1rem)] bg-cream-soft"
    >
      <div className="container-kama py-14 md:py-16 lg:py-20">
        {/* Section header */}
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="flex flex-col gap-3">
            {eyebrow ? <span className="eyebrow text-cocoa/60">{eyebrow}</span> : null}
            {heading ? (
              <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                {heading}
              </h2>
            ) : null}
            {description ? (
              <p className="max-w-[52ch] text-body text-cocoa/70">{description}</p>
            ) : null}
            <RichText value={section?.bodyHtml} className="max-w-[60ch] text-body text-cocoa/70" />
          </div>

          {showCta ? (
            <Link href={ctaHref} className="btn btn-outline shrink-0 border-cocoa/40">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        {/* Journal grid */}
        {cards.length > 0 ? (
          <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-10">
            {cards.map((card) => (
              <li key={card.key} className="flex h-full flex-col">
                <WhatsNewCardBody
                  card={card}
                  defaultEyebrow={defaultEyebrow}
                  defaultCtaLabel={defaultCtaLabel}
                />
              </li>
            ))}
          </ul>
        ) : emptyText ? (
          <p className="mt-8 text-body text-cocoa/60">{emptyText}</p>
        ) : null}
      </div>
    </Reveal>
  );
}