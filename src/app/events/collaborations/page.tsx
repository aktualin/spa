import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
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
  return withPageSeo("/events/collaborations", {});
}

export default async function CollaborationsPage() {
  const [{ collaborations }, pageCopy] = await Promise.all([
    getEventGroups(),
    getPageCopy(),
  ]);

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow={copy(pageCopy, "events.collab.hero_eyebrow")}
          title={copy(pageCopy, "events.collab.hero_title")}
          description={copy(pageCopy, "events.collab.hero_description")}
        />

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow={copy(pageCopy, "events.collab.section_eyebrow")}
              title={copy(pageCopy, "events.collab.section_title")}
            />
            {collaborations.length > 0 ? (
              <EventGrid events={collaborations} />
            ) : (
              <div className="mt-8">
                <PublicEmptyState
                  title={copy(pageCopy, "events.collab.empty_title")}
                  description={copy(pageCopy, "events.collab.empty_description")}
                />
              </div>
            )}
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
