import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeferredNavigation } from "@/components/public/deferred-navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
} from "@/components/public/page-parts";
import { formatEventDate } from "@/components/public/events/event-parts";
import { getActivePromo } from "@/lib/content/promos";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { plainTextToHtml } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { whatsAppHref } from "@/lib/content/whatsapp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [promo, pageCopy] = await Promise.all([
    getActivePromo(slug),
    getPageCopy(),
  ]);
  if (!promo) {
    const pageCopy = await getPageCopy();
    return { title: copy(pageCopy, "promos.detail.not_found_title") || undefined };
  }
  return withPageSeo(`/promos/${promo.slug}`, {
    title: promo.seoTitle ?? promo.title,
    description: promo.seoDescription ?? promo.description ?? undefined,
    openGraph: promo.bannerUrl
      ? { images: [{ url: promo.bannerUrl, alt: promo.title }] }
      : undefined,
  });
}

export default async function PromoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  /* Slug adalah runtime data — dibaca di dalam Suspense boundary. */
  const pageCopy = await getPageCopy();
  return (
    <>
      <DeferredNavigation />
      <Suspense
        fallback={
          <PromoFallback
            eyebrow={copy(pageCopy, "promos.hero.eyebrow")}
            title={copy(pageCopy, "promos.detail.loading_title")}
          />
        }
      >
        <PromoContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

function PromoFallback({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <main className="flex-1">
      <PublicPageHeader eyebrow={eyebrow} title={title} />
    </main>
  );
}

async function PromoContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
        description={promo.description ?? undefined}
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

      {promo.bannerUrl ? (
        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-10 md:py-14">
            <div className="aspect-[16/9] overflow-hidden bg-cream-card">
              <img
                src={promo.bannerUrl}
                alt={promo.title}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Reveal>
      ) : null}

      <Reveal as="section" className="bg-cream-soft">
        <div className="container-kama py-14 md:py-16 lg:py-20">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                {copy(pageCopy, "promos.detail.title")}
              </h2>
              {promo.description ? (
                <p className="max-w-[70ch] text-lead text-cocoa/80">
                  {promo.description}
                </p>
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
                  className="text-rich-text max-w-[70ch] text-body text-cocoa/80"
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
