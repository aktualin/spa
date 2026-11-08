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
import { withPageSeo } from "@/lib/content/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/events", {
    title: "Events",
    description:
      "Upcoming events dan program KAMA Spa — personally curated experiences, corporate wellness, dan kolaborasiksi dengan brandtemu.",
  });
}

export default async function EventsPage() {
  const { upcoming, past } = await getEventGroups();

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow="Events"
          title="Upcoming events at KAMA Spa."
          description="Program dan kolaborasi yang kami siapkan untuk Anda — baik yang akan datang maupun yang sudah berlalu."
        />

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow="Upcoming"
              title="Yang akan datang"
              description="Event yang masih bisa Anda ikuti — daftar tempat terbatas."
            />
            {upcoming.length > 0 ? (
              <EventGrid events={upcoming} />
            ) : (
              <div className="mt-8">
                <PublicEmptyState
                  title="Belum ada event yang terjadwal"
                  description="Nantikan pengumuman berikutnya — follow @kama__spa untuk update terbaru."
                />
              </div>
            )}
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream-soft">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow="Past Events"
              title="Telah berlalu"
              description="Potongan momentarily yang pernah kami jalankan."
            />
            {past.length > 0 ? (
              <EventGrid events={past} />
            ) : (
              <div className="mt-8">
                <PublicEmptyState
                  title="Belum ada riwayat event"
                  description="Riwayat event akan tampil di sini setelah program selesai."
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
                  Past collaborations
                </h2>
                <p className="max-w-[52ch] text-body text-cocoa/70">
                  Program wellness yang pernah kami jalankan bersama partner dan
                  perusahaan.
                </p>
              </div>
              <Link
                href="/events/collaborations"
                className="btn btn-outline shrink-0 border-cocoa/40"
              >
                Lihat Kolaborasi
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
