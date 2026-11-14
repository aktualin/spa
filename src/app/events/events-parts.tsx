import { Reveal } from "@/components/reveal";
import { PublicEmptyState, PublicSectionHeader } from "@/components/public/page-parts";
import { EventGrid } from "@/components/public/events/event-parts";
import type { PublicEvent } from "@/lib/content/events";

/** Section grup event (upcoming/past): judul + grid atau empty state. */
export function EventGroupSection({
  eyebrow,
  title,
  description,
  emptyTitle,
  emptyDescription,
  events,
  sectionClassName,
}: {
  eyebrow: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  events: PublicEvent[];
  sectionClassName: string;
}) {
  return (
    <Reveal as="section" className={sectionClassName}>
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <PublicSectionHeader eyebrow={eyebrow} title={title} description={description} />
        {events.length > 0 ? (
          <EventGrid events={events} />
        ) : (
          <div className="mt-8">
            <PublicEmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        )}
      </div>
    </Reveal>
  );
}