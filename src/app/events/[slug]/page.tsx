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
  formatEventDate,
} from "@/components/public/events/event-parts";
import { getEvent } from "@/lib/content/events";
import { waLink } from "@/lib/whatsapp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event Not Found" };
  return {
    title: event.seoTitle ?? event.title,
    description: event.seoDescription ?? event.description ?? undefined,
    openGraph: event.coverUrl
      ? { images: [{ url: event.coverUrl }] }
      : undefined,
  };
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  /* Slug adalah runtime data — harus dibaca di dalam Suspense boundary. */
  return (
    <>
      <DeferredNavigation />
      <Suspense fallback={<EventFallback />}>
        <EventContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

function EventFallback() {
  return (
    <main className="flex-1">
      <PublicPageHeader eyebrow="Events" title="Memuat event…" />
    </main>
  );
}

async function EventContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  return (
    <main className="flex-1">
      <PublicPageHeader
        eyebrow={formatEventDate(event.startDate, event.endDate)}
        title={event.title}
        description={event.description ?? undefined}
      >
        <div className="button-group mt-4 flex flex-wrap gap-3">
          <a
            href={waLink(`Halo kak, saya mau ikut event ${event.title}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Daftar via WhatsApp
          </a>
          <Link href="/events" className="btn btn-outline border-cocoa/40">
            Semua Event
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
              Detail event
            </h2>
            {event.description ? (
              <p className="max-w-[70ch] text-lead text-cocoa/80">
                {event.description}
              </p>
            ) : (
              <PublicEmptyState
                title="Detail event belum tersedia"
                description="Hubungi kami via WhatsApp untuk informasi lebih lanjut."
              />
            )}
            {event.location ? (
              <p className="text-body text-cocoa/70">Lokasi: {event.location}</p>
            ) : null}
          </div>
        </div>
      </Reveal>

      <EventGallery event={event} />
    </main>
  );
}
