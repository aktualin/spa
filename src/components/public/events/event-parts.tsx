import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import type { PublicEvent } from "@/lib/content/events";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { formatEventDateRange } from "@/lib/domain/events";
import { toPlainText } from "@/lib/domain/rich-text";

/**
 * Format tanggal event — Bahasa Indonesia, selalu dalam WIB (server Vercel
 * berjalan di UTC; tanpa zona waktu, 00.00 WIB tampil mundur sehari).
 */
export function formatEventDate(startDate: Date | null, endDate: Date | null): string {
  return formatEventDateRange(startDate, endDate);
}

/** Logo/nama mitra kolaborasi — hanya tampil bila diisi. */
export async function EventPartner({
  event,
  size = "sm",
}: {
  event: PublicEvent;
  size?: "sm" | "lg";
}) {
  const pageCopy = await getPageCopy();
  if (!event.isCollaboration || (!event.partnerName && !event.partnerLogoUrl)) {
    return null;
  }
  const logoClass = size === "lg" ? "h-12 max-w-[10rem]" : "h-8 max-w-[7rem]";
  return (
    <span className="flex flex-wrap items-center gap-3">
      {event.partnerLogoUrl ? (
        <img
          src={event.partnerLogoUrl}
          alt={
            event.partnerName
              ? `${copy(pageCopy, "global.partner_logo_alt")} ${event.partnerName}`
              : copy(pageCopy, "global.partner_logo_alt")
          }
          loading="lazy"
          className={`${logoClass} w-auto object-contain`}
        />
      ) : null}
      {event.partnerName ? (
        <span className="text-body text-cocoa/70">
          {copy(pageCopy, "global.event_partner_prefix")} {event.partnerName}
        </span>
      ) : null}
    </span>
  );
}

export async function EventCard({ event }: { event: PublicEvent }) {
  const pageCopy = await getPageCopy();
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex h-full flex-col bg-cream"
    >
      {event.coverUrl ? (
        <div className="aspect-[16/10] overflow-hidden bg-cream-card">
          <img
            src={event.coverUrl}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="eyebrow text-cocoa/60">
          {formatEventDate(event.startDate, event.endDate)}
        </span>
        <h3 className="font-display text-title-sm md:text-[1.375rem] md:leading-[1.3]">
          {event.title}
        </h3>
        {event.location ? (
          <p className="text-body text-cocoa/70">{event.location}</p>
        ) : null}
        <EventPartner event={event} />
        {event.description ? (
          <p className="line-clamp-3 text-body text-cocoa/70">{toPlainText(event.description)}</p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[0.9375rem] underline underline-offset-4 transition-opacity group-hover:opacity-70">
          {copy(pageCopy, "global.view_detail_label")}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export async function EventGrid({ events }: { events: PublicEvent[] }) {
  return (
    <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {events.map((event) => (
        <li key={event.id} className="flex h-full">
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  );
}

export async function EventGallery({ event }: { event: PublicEvent }) {
  if (event.photos.length === 0) return null;
  const pageCopy = await getPageCopy();
  return (
    <Reveal as="section" className="bg-cream-soft">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
          {copy(pageCopy, "events.detail.gallery_title")}
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {event.photos.map((photo) => (
            <li
              key={photo.id}
              className="flex flex-col gap-2 bg-cream p-3"
            >
              <div className="aspect-square overflow-hidden bg-cream-card">
                <img
                  src={photo.imageUrl}
                  alt={photo.caption ?? event.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              {photo.caption ? (
                <span className="caption-s text-cocoa/70">{photo.caption}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
