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
import {
  EventGallery,
  EventPartner,
  formatEventDate,
} from "@/components/public/events/event-parts";
import { getEvent } from "@/lib/content/events";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { whatsAppHref } from "@/lib/content/whatsapp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) {
    const pageCopy = await getPageCopy();
    return { title: copy(pageCopy, "events.detail.not_found_title") || undefined };
  }
  return withPageSeo(`/events/${event.slug}`, {
    title: event.seoTitle ?? event.title,
    description: event.seoDescription ?? event.description ?? undefined,
    openGraph: event.coverUrl
      ? { images: [{ url: event.coverUrl, alt: event.title }] }
      : undefined,
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  /* Slug adalah runtime data — harus dibaca di dalam Suspense boundary. */
  const pageCopy = await getPageCopy();
  return (
    <>
      <DeferredNavigation />
      <Suspense
        fallback={
          <EventFallback
            eyebrow={copy(pageCopy, "events.hero.eyebrow")}
            title={copy(pageCopy, "events.detail.loading_title")}
          />
        }
      >
        <EventContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

function EventFallback({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <main className="flex-1">
      <PublicPageHeader eyebrow={eyebrow} title={title} />
    </main>
  );
}

async function EventContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [event, pageCopy] = await Promise.all([getEvent(slug), getPageCopy()]);

  if (!event) {
    notFound();
  }

  // Nomor dari pengaturan situs; pesan khusus event menang atas template.
  const registerHref = await whatsAppHref("default", {
    custom: `Halo kak, saya mau ikut event ${event.title}`,
  });

  return (
    <main className="flex-1">
      <PublicPageHeader
        eyebrow={formatEventDate(event.startDate, event.endDate)}
        title={event.title}
        description={event.description ?? undefined}
      >
        <div className="button-group mt-4 flex flex-wrap gap-3">
          {/* Pendaftaran hanya untuk event yang belum lewat. */}
          {event.phase !== "past" && registerHref ? (
            <a
              href={registerHref}
              data-wa-context="event"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              {copy(pageCopy, "events.detail.register_label")}
            </a>
          ) : null}
          <Link href="/events" className="btn btn-outline border-cocoa/40">
            {copy(pageCopy, "events.detail.back_label")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </PublicPageHeader>

      {event.coverUrl ? (
        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-10 md:py-14">
            <div className="aspect-[16/9] overflow-hidden bg-cream-card">
              <img
                src={event.coverUrl}
                alt={event.title}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Reveal>
      ) : null}

      <Reveal as="section" className="bg-cream-soft">
        <div className="container-kama py-14 md:py-16 lg:py-20">
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
              {copy(pageCopy, "events.detail.title")}
            </h2>
            {event.description ? (
              <p className="max-w-[70ch] text-lead text-cocoa/80">
                {event.description}
              </p>
            ) : (
              <PublicEmptyState
                title={copy(pageCopy, "events.detail.empty_title")}
                description={copy(pageCopy, "events.detail.empty_description")}
              />
            )}
            {event.location ? (
              <p className="text-body text-cocoa/70">
                {copy(pageCopy, "events.detail.location_prefix")} {event.location}
              </p>
            ) : null}
            {event.isCollaboration && (event.partnerName || event.partnerLogoUrl) ? (
              <div className="flex flex-col gap-2">
                <span className="eyebrow text-cocoa/60">{copy(pageCopy, "events.detail.collab_label")}</span>
                {event.partnerUrl ? (
                  <a
                    href={event.partnerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit transition-opacity hover:opacity-70"
                  >
                    <EventPartner event={event} size="lg" />
                  </a>
                ) : (
                  <EventPartner event={event} size="lg" />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </Reveal>

      <EventGallery event={event} />
    </main>
  );
}
