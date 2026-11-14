import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import { PublicEmptyState } from "@/components/public/page-parts";
import { EventPartner } from "@/components/public/events/event-parts";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { PublicEvent } from "@/lib/content/events";

/** Isi event: deskripsi, lokasi, dan partner kolaborasi. */
export function EventDetailBody({
  event,
  pageCopy,
}: {
  event: PublicEvent;
  pageCopy: PageCopy;
}) {
  return (
    <Reveal as="section" className="bg-cream-soft">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <div className="flex flex-col gap-6">
          <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
            {copy(pageCopy, "events.detail.title")}
          </h2>
          {event.description ? (
            <RichText value={event.description} className="max-w-[70ch] text-lead text-cocoa/80" />
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
  );
}