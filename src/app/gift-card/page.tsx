import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { PublicPageHeader } from "@/components/public/page-parts";
import { WaLink } from "@/components/public/wa-button";
import { getGiftCard } from "@/lib/content/gift-card";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { whatsAppHref } from "@/lib/content/whatsapp";
import { GIFT_CARD_DEFAULTS } from "@/lib/domain/gift-card";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/gift-card", {});
}

export default async function GiftCardPage() {
  const [giftCard, pageCopy] = await Promise.all([getGiftCard(), getPageCopy()]);

  if (!giftCard) {
    return (
      <>
        <Navigation />
        <main className="flex-1">
          <PublicPageHeader
            eyebrow={copy(pageCopy, "gift_card.hero.eyebrow")}
            title={copy(pageCopy, "gift_card.missing_title")}
            description={copy(pageCopy, "gift_card.missing_description")}
          />
        </main>
        <Footer />
      </>
    );
  }

  /* Teks bawaan yang mengisi kolom kosong bukan pesan khusus, jadi template
     "gift" boleh menggantikannya. */
  const waHref = await whatsAppHref("gift", {
    custom:
      giftCard.whatsappMessage === GIFT_CARD_DEFAULTS.whatsappMessage
        ? null
        : giftCard.whatsappMessage,
    values: { giftCard: giftCard.title },
  });

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow={copy(pageCopy, "gift_card.hero.eyebrow")}
          title={giftCard.title}
          description={giftCard.subtitle}
        >
          <div>
            <WaLink href={waHref} context="gift">
              {copy(pageCopy, "gift_card.order_label")}
            </WaLink>
          </div>
        </PublicPageHeader>

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div
                className="text-rich-text max-w-[60ch] text-body text-cocoa/80"
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
                  className="text-rich-text max-w-[70ch] text-body text-cocoa/80"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(giftCard.termsHtml) }}
                />
              </div>
            ) : null}
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream-soft">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <div className="flex flex-col items-start gap-5 bg-cream-card px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12 md:py-14">
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                  {copy(pageCopy, "gift_card.cta_title")}
                </h2>
                <p className="max-w-[52ch] text-body text-cocoa/70">
                  {copy(pageCopy, "gift_card.cta_description")}
                </p>
              </div>
              <Link
                href="/treatments"
                className="btn btn-outline shrink-0 border-cocoa/40"
              >
                {copy(pageCopy, "gift_card.cta_label")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
