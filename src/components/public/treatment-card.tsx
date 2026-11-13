/**
 * Kartu treatment untuk katalog publik (/treatments).
 *
 * Memakai kelas legacy yang sama dengan halaman /menu supaya tampilannya
 * konsisten: `.treatment-card`, `.treatment-card_image`, `.price-row`, dll.
 */
import Link from "next/link";

import type { CatalogTreatment } from "@/lib/content/catalog";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { formatDuration } from "@/lib/domain/pricing";
import { formatIdr } from "@/lib/format";

import { CatalogBadges } from "./catalog-badges";
import { WaButton } from "./wa-button";
import { toPlainText } from "@/lib/domain/rich-text";

type TreatmentCardProps = {
  treatment: CatalogTreatment;
  /** Tampilkan tombol WhatsApp di dalam kartu. */
  withCta?: boolean;
};

export async function TreatmentCard({ treatment, withCta = false }: TreatmentCardProps) {
  const pageCopy = await getPageCopy();
  const first = treatment.options[0];

  return (
    <div className="treatment-card w-dyn-item">
      <Link
        href={`/treatments/${treatment.categorySlug}/${treatment.slug}`}
        className="treatment-card_image image-container"
      >
        {treatment.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={treatment.imageUrl}
            alt={treatment.name}
            loading="lazy"
            className="image-cover"
          />
        ) : null}
      </Link>
      <div className="treatment-card_body">
        <div className="eyebrow-s text-style-allcaps">{treatment.categoryName}</div>
        <CatalogBadges
          isNew={treatment.isNew}
          isBestSeller={treatment.isBestSeller}
          newLabel={copy(pageCopy, "global.badge_new")}
          bestSellerLabel={copy(pageCopy, "global.badge_best_seller")}
        />
        <h3 className="header-s">
          <Link href={`/treatments/${treatment.categorySlug}/${treatment.slug}`}>
            {treatment.name}
          </Link>
        </h3>
        {treatment.description ? (
          <div className="body-m text-color-gray">{toPlainText(treatment.description)}</div>
        ) : null}

        {treatment.options.length > 0 ? (
          <div>
            {treatment.options.map((option) => (
              <div key={`${option.label}-${option.durationMin}`} className="price-row">
                <span className="price-row_duration">
                  {option.label || formatDuration(option.durationMin)}
                </span>
                <span className="price-row_value">{formatIdr(option.priceIdr)}</span>
              </div>
            ))}
          </div>
        ) : first ? (
          <div className="treatment-card_price-row">
            <span className="caption-s text-color-gray">
              {first.label || formatDuration(first.durationMin)}
            </span>
            <span className="price-row_value">{formatIdr(first.priceIdr)}</span>
          </div>
        ) : null}

        {withCta ? (
          <>
            <div className="spacer-small" />
            <WaButton
              context="treatment"
              custom={treatment.whatsappMessage}
              values={{ treatment: treatment.name, category: treatment.categoryName }}
              label={copy(pageCopy, "global.book_via_whatsapp")}
              className="button is-secondary is-icon w-inline-block"
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default TreatmentCard;
