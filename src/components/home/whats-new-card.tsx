import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import type { HighlightCard } from "@/lib/domain/homepage";

/**
 * Isi satu kartu "What's New". Kartu statis lama dan kartu highlight dari
 * admin (`HomepageHighlight`) memakai markup & class yang sama. Bagian yang
 * kosong (label kategori, gambar, tautan) dilewati, bukan diganti elemen lain.
 */
export function WhatsNewCardBody({
  card,
  defaultEyebrow,
  defaultCtaLabel,
}: {
  card: HighlightCard;
  defaultEyebrow: string;
  /** Label CTA cadangan (CB home.whats_new.cta_fallback) saat kartu bertautan. */
  defaultCtaLabel: string;
}) {
  const eyebrow = card.tag?.trim() || defaultEyebrow;
  const ctaLabel = card.ctaLabel?.trim() || defaultCtaLabel;
  const content = (
    <>
      <div className="aspect-[16/11] overflow-hidden bg-cream">
        {card.image ? (
          <img
            src={card.image}
            alt={card.imageAlt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-4">
        {eyebrow ? (
          <div className="flex items-center gap-2">
            <span className="eyebrow text-cocoa/60">{eyebrow}</span>
          </div>
        ) : null}
        <h3 className="font-display text-title-sm md:text-[1.375rem] md:leading-[1.3]">
          {card.title}
        </h3>
        {card.href && ctaLabel ? (
          <span className="mt-auto inline-flex items-center gap-2 text-[0.9375rem] underline underline-offset-4 transition-opacity hover:opacity-70">
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </span>
        ) : null}
      </div>
    </>
  );

  if (!card.href) {
    return <div className="group flex h-full flex-col">{content}</div>;
  }
  return (
    <Link href={card.href} className="group flex h-full flex-col">
      {content}
    </Link>
  );
}