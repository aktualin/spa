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
import { plainTextToHtml } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { waLink } from "@/lib/whatsapp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const promo = await getActivePromo(slug);
  if (!promo) return { title: "Promo Not Found" };
  return {
    title: promo.seoTitle ?? promo.title,
    description: promo.seoDescription ?? promo.description ?? undefined,
    openGraph: promo.bannerUrl ? { images: [{ url: promo.bannerUrl }] } : undefined,
  };
}

export default function PromoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  /* Slug adalah runtime data — dibaca di dalam Suspense boundary. */
  return (
    <>
      <DeferredNavigation />
      <Suspense fallback={<PromoFallback />}>
        <PromoContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

function PromoFallback() {
  return (
    <main className="flex-1">
      <PublicPageHeader eyebrow="Promos" title="Memuat promo…" />
    </main>
  );
}

async function PromoContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const promo = await getActivePromo(slug);

  /* Promo yang sudah berakhir atau tidak dipublikasikan → 404. */
  if (!promo) {
    notFound();
  }

  const waMessage = promo.whatsappMessage
    ? promo.whatsappMessage
    : `Halo kak, saya mau tanya promo ${promo.title}`;

  return (
    <main className="flex-1">
      <PublicPageHeader
        eyebrow={formatEventDate(promo.startDate, promo.endDate)}
        title={promo.title}
        description={promo.description ?? undefined}
      >
        <div className="button-group mt-4 flex flex-wrap gap-3">
          <a
            href={waLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Tanya Promo via WhatsApp
          </a>
          <Link href="/promos" className="btn btn-outline border-cocoa/40">
            Semua Promo
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
                Detail promo
              </h2>
              {promo.description ? (
                <p className="max-w-[70ch] text-lead text-cocoa/80">
                  {promo.description}
                </p>
              ) : (
                <PublicEmptyState
                  title="Detail promo belum tersedia"
                  description="Hubungi kami via WhatsApp untuk informasi lebih lanjut."
                />
              )}
            </div>

            {promo.terms ? (
              <div className="flex flex-col gap-3 border-t border-cocoa/15 pt-6">
                <h3 className="font-display text-title-sm md:text-[1.375rem]">
                  Syarat & ketentuan
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
