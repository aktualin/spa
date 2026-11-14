import type { PublicEvent } from "@/lib/content/events";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { formatEventDateRange } from "@/lib/domain/events";
import { DetailCard } from "@/components/public/detail-card";

export { EventGallery } from "./event-gallery";

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
  return (
    <DetailCard
      href={`/events/${event.slug}`}
      coverUrl={event.coverUrl}
      coverAspect="aspect-[16/10]"
      eyebrow={formatEventDate(event.startDate, event.endDate)}
      title={event.title}
      description={event.description}
    >
      {event.location ? (
        <p className="text-body text-cocoa/70">{event.location}</p>
      ) : null}
      <EventPartner event={event} />
    </DetailCard>
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