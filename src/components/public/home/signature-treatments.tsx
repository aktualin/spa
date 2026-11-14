import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { getSignatureTreatments } from "@/lib/content/catalog";
import type { HomepageSection } from "@/lib/content/homepage";
import type { PageCopy } from "@/lib/content/page-copy";
import { isSafeCtaHref } from "@/lib/domain/homepage-banner";
import { SignatureTreatmentCard } from "./signature-treatment-card";

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
          {treatments.map((treatment) => (
            <li key={treatment.slug} className="flex h-full flex-col">
              <SignatureTreatmentCard treatment={treatment} copyBlocks={copyBlocks} />
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}