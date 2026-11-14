import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@/components/icons";
import { PublicPageHeader } from "@/components/public/page-parts";
import { EventGallery, formatEventDate } from "@/components/public/events/event-parts";
import { getEvent } from "@/lib/content/events";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { whatsAppHref } from "@/lib/content/whatsapp";
import { toPlainText } from "@/lib/domain/rich-text";
import { DetailCover } from "../../_components/detail-parts";
import { EventDetailBody } from "./event-detail-body";

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

/** Isi detail event — slug dibaca di dalam Suspense. */
export async function EventDetailContent({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const [event, pageCopy] = await Promise.all([getEvent(slug), getPageCopy()]);

  if (!event) {
    notFound();
  }

  // Nomor dari pengaturan situs; pesan dari template konteks "event"
  // (placeholder {{event}} diisi judul event), bukan pesan hardcode.
  const registerHref = await whatsAppHref("event", {
    values: { event: event.title },
  });

  return (
    <main className="flex-1">
      <PublicPageHeader
        eyebrow={formatEventDate(event.startDate, event.endDate)}
        title={event.title}
        description={toPlainText(event.description, 220) || undefined}
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

      {event.coverUrl ? <DetailCover src={event.coverUrl} alt={event.title} /> : null}

      <EventDetailBody event={event} pageCopy={pageCopy} />

      <EventGallery event={event} />
    </main>
  );
}