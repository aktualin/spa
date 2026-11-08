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
import { withPageSeo } from "@/lib/content/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/events/collaborations", {
    title: "Past Collaborations",
    description:
      "Program wellness KAMA Spa yang pernah dijalankan bersama partner, perusahaan, dan brand — a glimpse of wellness in action.",
  });
}

export default async function CollaborationsPage() {
  const { collaborations } = await getEventGroups();

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow="Collaborations"
          title="Wellness in action — on location."
          description="Program corporate wellness dan kolaborasi yang pernah kami jalankan bersama partner."
        />

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow="Past Collaborations"
              title="Program yang pernah berjalan"
            />
            {collaborations.length > 0 ? (
              <EventGrid events={collaborations} />
            ) : (
              <div className="mt-8">
                <PublicEmptyState
                  title="Belum ada kolaborasi yang tercatat"
                  description="Kolaborasi yang sudah selesai akan tampil di sini."
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
