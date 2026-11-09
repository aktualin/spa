import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
  PublicSectionHeader,
} from "@/components/public/page-parts";
import { EventGrid } from "@/components/public/events/event-parts";
import { getEventGroups } from "@/lib/content/events";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";

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

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow={copy(pageCopy, "events.upcoming.eyebrow")}
              title={copy(pageCopy, "events.upcoming.title")}
              description={copy(pageCopy, "events.upcoming.description")}
            />
            {upcoming.length > 0 ? (
              <EventGrid events={upcoming} />
            ) : (
              <div className="mt-8">
                <PublicEmptyState
                  title={copy(pageCopy, "events.upcoming.empty_title")}
                  description={copy(pageCopy, "events.upcoming.empty_description")}
                />
              </div>
            )}
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream-soft">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow={copy(pageCopy, "events.past.eyebrow")}
              title={copy(pageCopy, "events.past.title")}
              description={copy(pageCopy, "events.past.description")}
            />
            {past.length > 0 ? (
              <EventGrid events={past} />
            ) : (
              <div className="mt-8">
                <PublicEmptyState
                  title={copy(pageCopy, "events.past.empty_title")}
                  description={copy(pageCopy, "events.past.empty_description")}
                />
              </div>
            )}
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <div className="flex flex-col items-start gap-5 bg-cream-card px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12 md:py-14">
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                  {copy(pageCopy, "events.collab_title")}
                </h2>
                <p className="max-w-[52ch] text-body text-cocoa/70">
                  {copy(pageCopy, "events.collab_description")}
                </p>
              </div>
              <Link
                href="/events/collaborations"
                className="btn btn-outline shrink-0 border-cocoa/40"
              >
                {copy(pageCopy, "events.collab_cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
