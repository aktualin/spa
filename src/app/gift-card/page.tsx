import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PublicPageHeader } from "@/components/public/page-parts";
import { WaLink } from "@/components/public/wa-button";
import { getGiftCard } from "@/lib/content/gift-card";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { whatsAppHref } from "@/lib/content/whatsapp";
import { GiftCardCta, GiftCardDetails } from "./gift-card-sections";

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

  /* Admin mengosongkan pesan → template "gift" yang dipakai. */
  const waHref = await whatsAppHref("gift", {
    custom: giftCard.whatsappMessage.trim() || null,
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

        <GiftCardDetails giftCard={giftCard} pageCopy={pageCopy} />
        <GiftCardCta pageCopy={pageCopy} />
      </main>
      <Footer />
    </>
  );
}