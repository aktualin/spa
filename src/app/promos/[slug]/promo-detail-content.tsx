import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import { PublicEmptyState, PublicPageHeader } from "@/components/public/page-parts";
import { formatEventDate } from "@/components/public/events/event-parts";
import { getActivePromo } from "@/lib/content/promos";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { plainTextToHtml, toPlainText } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { whatsAppHref } from "@/lib/content/whatsapp";
import { DetailCover } from "../../_components/detail-parts";

type PromoDetailPageProps = {
  params: Promise<{ slug: string }>;
};

/** Isi detail promo — slug dibaca di dalam Suspense. */
export async function PromoDetailContent({ params }: PromoDetailPageProps) {
  const { slug } = await params;
  const [promo, pageCopy] = await Promise.all([
    getActivePromo(slug),
    getPageCopy(),
  ]);

  /* Promo yang sudah berakhir atau tidak dipublikasikan → 404. */
  if (!promo) {
    notFound();
  }

  const waHref = await whatsAppHref("promo", {
    custom: promo.whatsappMessage,
    values: { promo: promo.title },
  });

  return (
    <main className="flex-1">
      <PublicPageHeader
        eyebrow={formatEventDate(promo.startDate, promo.endDate)}
        title={promo.title}
        description={toPlainText(promo.description, 220) || undefined}
      >
        <div className="button-group mt-4 flex flex-wrap gap-3">
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              data-wa-context="promo"
            >
              {copy(pageCopy, "promos.detail.ask_label")}
            </a>
          ) : null}
          <Link href="/promos" className="btn btn-outline border-cocoa/40">
            {copy(pageCopy, "promos.detail.back_label")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </PublicPageHeader>

      {promo.bannerUrl ? <DetailCover src={promo.bannerUrl} alt={promo.title} /> : null}

      <Reveal as="section" className="bg-cream-soft">
        <div className="container-kama py-14 md:py-16 lg:py-20">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                {copy(pageCopy, "promos.detail.title")}
              </h2>
              {promo.description ? (
                <RichText value={promo.description} className="max-w-[70ch] text-lead text-cocoa/80" />
              ) : (
                <PublicEmptyState
                  title={copy(pageCopy, "promos.detail.empty_title")}
                  description={copy(pageCopy, "promos.detail.empty_description")}
                />
              )}
            </div>

            {promo.terms ? (
              <div className="flex flex-col gap-3 border-t border-cocoa/15 pt-6">
                <h3 className="font-display text-title-sm md:text-[1.375rem]">
                  {copy(pageCopy, "promos.detail.terms_title")}
                </h3>
                <div
                  className="kama-prose text-rich-text max-w-[70ch] text-body text-cocoa/80"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(plainTextToHtml(promo.terms)),
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </Reveal>
    </main>
  );
}