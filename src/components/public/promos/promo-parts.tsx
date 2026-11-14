import { DetailCard } from "@/components/public/detail-card";
import { formatEventDate } from "@/components/public/events/event-parts";
import type { PublicPromo } from "@/lib/content/promos";

export async function PromoCard({ promo }: { promo: PublicPromo }) {
  return (
    <DetailCard
      href={`/promos/${promo.slug}`}
      coverUrl={promo.bannerUrl}
      coverAspect="aspect-[16/9]"
      eyebrow={formatEventDate(promo.startDate, promo.endDate)}
      title={promo.title}
      description={promo.description}
    />
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