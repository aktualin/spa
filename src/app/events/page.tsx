import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PublicPageHeader } from "@/components/public/page-parts";
import { getEventGroups } from "@/lib/content/events";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { CtaBanner } from "../_components/cta-banner";
import { EventGroupSection } from "./events-parts";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/events", {});
}

export default async function EventsPage() {
  const [{ upcoming, past }, pageCopy] = await Promise.all([
    getEventGroups(),
    getPageCopy(),
  ]);

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow={copy(pageCopy, "events.hero.eyebrow")}
          title={copy(pageCopy, "events.hero.title")}
          description={copy(pageCopy, "events.hero.description")}
        />

        <EventGroupSection
          eyebrow={copy(pageCopy, "events.upcoming.eyebrow")}
          title={copy(pageCopy, "events.upcoming.title")}
          description={copy(pageCopy, "events.upcoming.description")}
          emptyTitle={copy(pageCopy, "events.upcoming.empty_title")}
          emptyDescription={copy(pageCopy, "events.upcoming.empty_description")}
          events={upcoming}
          sectionClassName="bg-cream"
        />
        <EventGroupSection
          eyebrow={copy(pageCopy, "events.past.eyebrow")}
          title={copy(pageCopy, "events.past.title")}
          description={copy(pageCopy, "events.past.description")}
          emptyTitle={copy(pageCopy, "events.past.empty_title")}
          emptyDescription={copy(pageCopy, "events.past.empty_description")}
          events={past}
          sectionClassName="bg-cream-soft"
        />

        <CtaBanner
          title={copy(pageCopy, "events.collab_title")}
          description={copy(pageCopy, "events.collab_description")}
          href={copy(pageCopy, "events.collab_href") || "/events/collaborations"}
          label={copy(pageCopy, "events.collab_cta")}
          sectionClassName="bg-cream"
        />
      </main>
      <Footer />
    </>
  );
}