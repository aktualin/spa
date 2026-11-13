import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { getActivePromos } from "@/lib/content/promos";
import { getEventGroups } from "@/lib/content/events";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import { formatEventDate } from "@/components/public/events/event-parts";
import { toPlainText } from "@/lib/domain/rich-text";

/**
 * Section "Promo Highlight" — promo aktif, atau event terdekat yang akan
 * datang bila tidak ada promo. Hanya dirender bila baris section-nya ada
 * di DB dan aktif.
 */
export async function PromoHighlightSection({ copyBlocks }: { copyBlocks: PageCopy }) {
  const [promos, { upcoming }] = await Promise.all([
    getActivePromos(),
    getEventGroups(),
  ]);

  const promo = promos[0];
  const event = upcoming[0];

  if (!promo && !event) return null;

  const promoEyebrow = copy(copyBlocks, "home.promo.eyebrow");
  const eventEyebrow = copy(copyBlocks, "home.promo.event_eyebrow");
  const fallbackDescription = copy(copyBlocks, "home.promo.fallback_description");
  const promoLabel = copy(copyBlocks, "home.promo.cta_label");
  const eventLabel = copy(copyBlocks, "home.promo.event_cta_label");

  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <div className="flex flex-col items-start gap-6 bg-cream-card px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12 md:py-14">
          <div className="flex flex-col gap-3">
            <span className="eyebrow text-cocoa/60">
              {promo ? promoEyebrow : eventEyebrow}
            </span>
            <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
              {promo ? promo.title : event?.title}
            </h2>
            <p className="max-w-[52ch] text-body text-cocoa/70">
              {promo
                ? (toPlainText(promo.description) || fallbackDescription)
                : event
                  ? `${formatEventDate(event.startDate, event.endDate)}${
                      event.location ? ` · ${event.location}` : ""
                    }`
                  : ""}
            </p>
          </div>

          {promo ? (
            <Link href={`/promos/${promo.slug}`} className="btn btn-primary shrink-0">
              {promoLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : event ? (
            <Link href={`/events/${event.slug}`} className="btn btn-primary shrink-0">
              {eventLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}
