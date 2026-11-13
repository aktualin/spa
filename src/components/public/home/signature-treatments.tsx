import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { CatalogBadges } from "@/components/public/catalog-badges";
import { Reveal } from "@/components/reveal";
import { getSignatureTreatments, toPriceLabel } from "@/lib/content/catalog";
import type { HomepageSection } from "@/lib/content/homepage";
import { copy } from "@/lib/content/page-copy";
import type { PageCopy } from "@/lib/content/page-copy";
import { isSafeCtaHref } from "@/lib/domain/homepage-banner";
import { toPlainText } from "@/lib/domain/rich-text";

/**
 * Section "Signature Treatments" — treatment yang ditandai best seller di
 * admin. Judul, deskripsi, dan tombol berasal dari `HomepageSection`.
 */
export async function SignatureTreatmentsSection({
  section,
  copyBlocks,
}: {
  section?: HomepageSection | null;
  copyBlocks: PageCopy;
}) {
  const treatments = await getSignatureTreatments(6);

  if (treatments.length === 0) return null;

  const eyebrow = section?.eyebrow?.trim() || "";
  const title = section?.title?.trim() || "";
  const subtitle = section?.subtitle?.trim() || "";
  const ctaLabel = section?.ctaLabel?.trim() || "";
  const ctaHrefRaw = section?.ctaHref?.trim() || "";
  const ctaHref =
    ctaLabel && ctaHrefRaw && isSafeCtaHref(ctaHrefRaw) ? ctaHrefRaw : "";

  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="flex flex-col gap-3">
            {eyebrow ? <span className="eyebrow text-cocoa/60">{eyebrow}</span> : null}
            {title ? (
              <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="max-w-[52ch] text-body text-cocoa/70">{subtitle}</p>
            ) : null}
          </div>

          {ctaHref ? (
            <Link href={ctaHref} className="btn btn-outline shrink-0 border-cocoa/40">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-8">
          {treatments.map((treatment) => {
            const price = treatment.options[0];
            return (
              <li key={treatment.slug} className="flex h-full flex-col">
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
              </li>
            );
          })}
        </ul>
      </div>
    </Reveal>
  );
}
