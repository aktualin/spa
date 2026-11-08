import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { PublicPageHeader, WhatsAppLink } from "@/components/public/page-parts";
import { getGiftCard } from "@/lib/content/gift-card";
import { withPageSeo } from "@/lib/content/seo";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { waLink } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/gift-card", {
    title: "Gift Card",
    description:
      "KAMA Gift Card — hadiah berupa waktu istirahat, berlaku untuk seluruh treatment dan ritual KAMA Spa.",
  });
}

export default async function GiftCardPage() {
  const giftCard = await getGiftCard();

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow="Gift Card"
          title={giftCard.title}
          description={giftCard.subtitle}
        >
          <div>
            <WhatsAppLink
              href={waLink(giftCard.whatsappMessage)}
              label="Pesan via WhatsApp"
            />
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
                  Syarat & ketentuan
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
                  Bingung pilih treatment?
                </h2>
                <p className="max-w-[52ch] text-body text-cocoa/70">
                  Lihat seluruh menu dulu — gift card berlaku untuk semuanya.
                </p>
              </div>
              <Link
                href="/treatments"
                className="btn btn-outline shrink-0 border-cocoa/40"
              >
                Lihat Treatments
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
