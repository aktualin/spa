import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { getActivePromos } from "@/lib/content/promos";
import { getEventGroups } from "@/lib/content/events";
import { formatEventDate } from "@/components/public/events/event-parts";

/**
 * Section "Promo Highlight" — promo aktif, atau event terdekat yang akan
 * datang bila tidak ada promo. Hanya dirender bila baris section-nya ada
 * di DB dan aktif.
 */
export async function PromoHighlightSection() {
  const [promos, { upcoming }] = await Promise.all([
    getActivePromos(),
    getEventGroups(),
  ]);

  const promo = promos[0];
  const event = upcoming[0];

  if (!promo && !event) return null;

  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <div className="flex flex-col items-start gap-6 bg-cream-card px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12 md:py-14">
          <div className="flex flex-col gap-3">
            <span className="eyebrow text-cocoa/60">
              {promo ? "Promo" : "Upcoming Event"}
            </span>
            <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
              {promo ? promo.title : event?.title}
            </h2>
            <p className="max-w-[52ch] text-body text-cocoa/70">
              {promo
                ? (promo.description ??
                  "Promo sedang berjalan — cek detailnya di halaman promo.")
                : event
                  ? `${formatEventDate(event.startDate, event.endDate)}${
                      event.location ? ` · ${event.location}` : ""
                    }`
                  : ""}
            </p>
          </div>

          <Link
            href={promo ? `/promos/${promo.slug}` : `/events/${event?.slug}`}
            className="btn btn-primary shrink-0"
          >
            {promo ? "Lihat Promo" : "Lihat Event"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
