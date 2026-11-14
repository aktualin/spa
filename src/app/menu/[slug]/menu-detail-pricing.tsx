import Link from "next/link";
import { Check } from "@/components/icons";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { Package, Treatment } from "@/data/content";

/** Kartu harga detail menu: paket (includes) atau treatment (per durasi). */
export function MenuDetailPricing({
  entry,
  priceDisclaimer,
  pageCopy,
}: {
  entry: Treatment | Package;
  priceDisclaimer: string;
  pageCopy: PageCopy;
}) {
  return (
    <div className="package-card">
      <div className="package-card_body">
        <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "menu.detail.pricing_label")}</div>

        {entry.kind === "package" ? (
          <>
            <div className="price-row">
              <span className="price-row_duration">{entry.duration}</span>
              <span className="price-row_value">{entry.price}</span>
            </div>
            <div className="spacer-small" />
            <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "menu.detail.include_label")}</div>
            <div className="package-includes">
              {entry.includes.map((inc) => (
                <span key={inc.label} className="package-includes_item">
                  <Check />
                  {inc.label} {inc.minutes}
                </span>
              ))}
            </div>
          </>
        ) : (
          entry.prices.map((p) => (
            <div key={p.duration} className="price-row">
              <span className="price-row_duration">{p.duration}</span>
              <span className="price-row_value">{p.price}</span>
            </div>
          ))
        )}

        {priceDisclaimer ? (
          <>
            <div className="spacer-small" />
            <div className="eyebrow-s text-color-gray">
              {priceDisclaimer}
            </div>
          </>
        ) : null}

        <div className="spacer-medium" />
        <Link
          href={copy(pageCopy, "menu.detail_book_href") || "/contact"}
          className="button width-fill w-inline-block"
        >
          <div>{copy(pageCopy, "menu.detail.book_label")}</div>
        </Link>
      </div>
    </div>
  );
}