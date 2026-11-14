import Link from "next/link";

import { CatalogBadges } from "@/components/public/catalog-badges";
import type { CatalogTreatment } from "@/lib/content/catalog";
import { toPriceLabel } from "@/lib/content/catalog";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import { toPlainText } from "@/lib/domain/rich-text";

/** Kartu satu signature treatment: gambar, badge, nama, harga opsi pertama. */
export function SignatureTreatmentCard({
  treatment,
  copyBlocks,
}: {
  treatment: CatalogTreatment;
  copyBlocks: PageCopy;
}) {
  const price = treatment.options[0];
  return (
    <Link
      href={`/menu/${treatment.slug}`}
      className="group flex h-full flex-col bg-cream-card"
    >
      {treatment.imageUrl ? (
        <div className="aspect-[16/11] overflow-hidden bg-cream">
          <img
            src={treatment.imageUrl}
            alt={treatment.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="eyebrow text-cocoa/60">
          {treatment.categoryName}
        </span>
        <CatalogBadges
          isNew={treatment.isNew}
          isBestSeller={treatment.isBestSeller}
          newLabel={copy(copyBlocks, "global.badge_new")}
          bestSellerLabel={copy(copyBlocks, "global.badge_best_seller")}
        />
        <h3 className="font-display text-title-sm md:text-[1.375rem] md:leading-[1.3]">
          {treatment.name}
        </h3>
        {treatment.description ? (
          <p className="line-clamp-3 text-body text-cocoa/70">
            {toPlainText(treatment.description)}
          </p>
        ) : null}
        {price ? (
          <div className="mt-auto flex items-baseline gap-2 pt-2">
            <span className="caption-s text-cocoa/60">
              {price.label}
            </span>
            <span className="font-display text-title-sm">
              {toPriceLabel(price.priceIdr)}
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}