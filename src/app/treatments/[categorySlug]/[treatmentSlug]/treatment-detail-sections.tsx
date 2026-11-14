import { Reveal } from "@/components/reveal";
import { TreatmentCard } from "@/components/public/treatment-card";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { CatalogTreatment } from "@/lib/content/catalog";
import { formatDuration } from "@/lib/domain/pricing";
import { formatIdr } from "@/lib/format";

/** Daftar harga per opsi durasi treatment. */
export function TreatmentPricing({
  options,
  pageCopy,
}: {
  options: CatalogTreatment["options"];
  pageCopy: PageCopy;
}) {
  if (options.length === 0) return null;

  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
          {copy(pageCopy, "catalog.treatment.pricing_title")}
        </h2>
        <ul className="mt-8 flex max-w-[48rem] flex-col">
          {options.map((option) => (
            <li
              key={`${option.label}-${option.durationMin}`}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-cocoa/15 py-4"
            >
              <span className="text-body">{option.label}</span>
              <span className="text-caption text-cocoa/60">
                {formatDuration(option.durationMin)}
              </span>
              <span className="font-display text-title-sm">
                {formatIdr(option.priceIdr)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

/** Treatment lain dalam kategori yang sama (maks. 3). */
export function RelatedTreatments({
  related,
  categoryName,
  pageCopy,
}: {
  related: CatalogTreatment[];
  categoryName: string;
  pageCopy: PageCopy;
}) {
  if (related.length === 0) return null;

  return (
    <Reveal as="section" className="bg-cream-soft">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
          {copy(pageCopy, "catalog.treatment.related_prefix")} {categoryName}
        </h2>
        <div className="w-layout-grid whats-new_list mt-8">
          {related.map((other) => (
            <TreatmentCard key={other.slug} treatment={other} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}