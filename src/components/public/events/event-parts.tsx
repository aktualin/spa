import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import type { PublicEvent } from "@/lib/content/events";

/** Format tanggal event — Bahasa Indonesia, tanpa timezone gymnastics. */
export function formatEventDate(startDate: Date | null, endDate: Date | null): string {
  if (!startDate) return "Tanggal menyusul";
  const start = startDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (!endDate) return start;
  const end = endDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${start} — ${end}`;
}

export function EventCard({ event }: { event: PublicEvent }) {
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
        {event.description ? (
          <p className="line-clamp-3 text-body text-cocoa/70">{event.description}</p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[0.9375rem] underline underline-offset-4 transition-opacity group-hover:opacity-70">
          Lihat Detail
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export function EventGrid({ events }: { events: PublicEvent[] }) {
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

export function EventGallery({ event }: { event: PublicEvent }) {
  if (event.photos.length === 0) return null;
  return (
    <Reveal as="section" className="bg-cream-soft">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
          Galeri Event
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
