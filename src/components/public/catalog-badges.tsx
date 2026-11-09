/**
 * Badge New / Best Seller untuk katalog. Gaya mengikuti halaman detail
 * treatment supaya kartu dan detail terlihat sama.
 */
export function CatalogBadges({
  isNew,
  isBestSeller,
  newLabel,
  bestSellerLabel,
  className = "",
}: {
  isNew: boolean;
  isBestSeller: boolean;
  newLabel: string;
  bestSellerLabel: string;
  className?: string;
}) {
  if (!isNew && !isBestSeller) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      {isNew && newLabel ? (
        <span className="border border-cocoa/20 px-2 py-0.5 text-caption text-cocoa/60">
          {newLabel}
        </span>
      ) : null}
      {isBestSeller && bestSellerLabel ? (
        <span className="border border-cocoa/20 px-2 py-0.5 text-caption text-cocoa/60">
          {bestSellerLabel}
        </span>
      ) : null}
    </div>
  );
}

export default CatalogBadges;
