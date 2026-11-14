import { Reveal } from "@/components/reveal";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { GiftCard } from "@/lib/content/gift-card";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { CtaBanner } from "../_components/cta-banner";

/** Isi gift card: body HTML + gambar, lalu terms & conditions bila ada. */
export function GiftCardDetails({
  giftCard,
  pageCopy,
}: {
  giftCard: GiftCard;
  pageCopy: PageCopy;
}) {
  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div
            className="kama-prose text-rich-text max-w-[60ch] text-body text-cocoa/80"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(giftCard.bodyHtml),
            }}
          />
          {giftCard.imageUrl ? (
            <div className="image-container aspect-[4/3] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={giftCard.imageUrl}
                alt={giftCard.title}
                className="image-cover"
              />
            </div>
          ) : null}
        </div>

        {giftCard.termsHtml ? (
          <div className="mt-10 flex flex-col gap-3 border-t border-cocoa/15 pt-6">
            <h2 className="font-display text-title-sm md:text-[1.375rem]">
              {copy(pageCopy, "gift_card.terms_title")}
            </h2>
            <div
              className="kama-prose text-rich-text max-w-[70ch] text-body text-cocoa/80"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(giftCard.termsHtml) }}
            />
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}

/** Banner ajakan lihat treatments di bawah halaman gift card. */
export function GiftCardCta({ pageCopy }: { pageCopy: PageCopy }) {
  return (
    <CtaBanner
      title={copy(pageCopy, "gift_card.cta_title")}
      description={copy(pageCopy, "gift_card.cta_description")}
      href={copy(pageCopy, "gift_card.cta_href") || "/treatments"}
      label={copy(pageCopy, "gift_card.cta_label")}
    />
  );
}