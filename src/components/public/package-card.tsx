/**
 * Kartu paket (All Day Spa / bundle) untuk katalog publik.
 */
import Link from "next/link";

import type { CatalogPackage } from "@/lib/content/catalog";
import { formatDuration } from "@/lib/domain/pricing";
import { formatIdr } from "@/lib/format";

import { WaButton } from "./wa-button";

type PackageCardProps = {
  pkg: CatalogPackage;
  withCta?: boolean;
};

export function PackageCard({ pkg, withCta = false }: PackageCardProps) {
  return (
    <div className="package-card w-dyn-item">
      <Link href={`/treatments/packages/${pkg.slug}`} className="package-card_image image-container">
        {pkg.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pkg.imageUrl}
            alt={pkg.name}
            loading="lazy"
            className="image-cover"
          />
        ) : null}
      </Link>
      <div className="package-card_body">
        <div className="eyebrow-s text-style-allcaps">Package</div>
        <h3 className="header-s">
          <Link href={`/treatments/packages/${pkg.slug}`}>{pkg.name}</Link>
        </h3>
        {pkg.description ? (
          <div className="body-m text-color-gray">{pkg.description}</div>
        ) : null}

        {pkg.items.length > 0 ? (
          <div className="package-includes">
            {pkg.items.map((item, index) => (
              <span key={`${item.label}-${index}`} className="package-includes_item">
                {item.label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="treatment-card_price-row">
          <span className="caption-s text-color-gray">
            {pkg.durationMin ? formatDuration(pkg.durationMin) : "Duration"}
          </span>
          <span className="price-row_value">{formatIdr(pkg.priceIdr)}</span>
        </div>

        {withCta ? (
          <>
            <div className="spacer-small" />
            <WaButton
              context="package"
              custom={pkg.whatsappMessage}
              values={{
                package: pkg.name,
                price: formatIdr(pkg.priceIdr),
                duration: pkg.durationMin ? formatDuration(pkg.durationMin) : null,
              }}
              label="Book via WhatsApp"
              className="button is-secondary is-icon w-inline-block"
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default PackageCard;
