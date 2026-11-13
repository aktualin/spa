import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import type { PublicPromo } from "@/lib/content/promos";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { formatEventDate } from "@/components/public/events/event-parts";
import { toPlainText } from "@/lib/domain/rich-text";

export async function PromoCard({ promo }: { promo: PublicPromo }) {
  const pageCopy = await getPageCopy();
  return (
    <Link href={`/promos/${promo.slug}`} className="group flex h-full flex-col bg-cream">
      {promo.bannerUrl ? (
        <div className="aspect-[16/9] overflow-hidden bg-cream-card">
          <img
            src={promo.bannerUrl}
            alt={promo.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="eyebrow text-cocoa/60">
          {formatEventDate(promo.startDate, promo.endDate)}
        </span>
        <h3 className="font-display text-title-sm md:text-[1.375rem] md:leading-[1.3]">
          {promo.title}
        </h3>
        {promo.description ? (
          <p className="line-clamp-3 text-body text-cocoa/70">{toPlainText(promo.description)}</p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[0.9375rem] underline underline-offset-4 transition-opacity group-hover:opacity-70">
          {copy(pageCopy, "global.view_detail_label")}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export async function PromoGrid({ promos }: { promos: PublicPromo[] }) {
  return (
    <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {promos.map((promo) => (
        <li key={promo.id} className="flex h-full">
          <PromoCard promo={promo} />
        </li>
      ))}
    </ul>
  );
}
