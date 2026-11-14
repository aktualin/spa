import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { WaLink } from "@/components/public/wa-button";
import { carouselLabels } from "@/components/carousel-labels";
import { ImageCarousel } from "@/components/image-carousel";
import { getCategory, getTreatment } from "@/lib/content/catalog";
import { getCatalogImagesBySlug } from "@/lib/content/content-images";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { whatsAppHref } from "@/lib/content/whatsapp";
import { RichText } from "@/components/rich-text";
import { BackLink } from "../../../_components/detail-parts";
import { buildGallery } from "../../../_components/gallery";
import { RelatedTreatments, TreatmentPricing } from "./treatment-detail-sections";

type TreatmentPageProps = {
  params: Promise<{ categorySlug: string; treatmentSlug: string }>;
};

/** Isi detail treatment — slug dibaca di dalam Suspense. */
export async function TreatmentDetailContent({ params }: TreatmentPageProps) {
  const { categorySlug, treatmentSlug } = await params;
  const [treatment, pageCopy, galleryImages] = await Promise.all([
    getTreatment(categorySlug, treatmentSlug),
    getPageCopy(),
    getCatalogImagesBySlug(treatmentSlug),
  ]);

  if (!treatment) notFound();

  const gallery = buildGallery(treatment.imageUrl, galleryImages);

  const category = await getCategory(categorySlug);
  const related = (category?.treatments ?? [])
    .filter((t) => t.slug !== treatment.slug)
    .slice(0, 3);
  const waHref = await whatsAppHref("treatment", {
    custom: treatment.whatsappMessage,
    values: { treatment: treatment.name, category: treatment.categoryName },
  });

  return (
    <main className="flex-1">
      <Reveal as="section" className="bg-cream-soft">
        <div className="container-kama py-14 md:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col gap-4">
              <BackLink href={`/treatments/${categorySlug}`}>
                {treatment.categoryName}
              </BackLink>
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow text-cocoa/60">
                  {treatment.categoryName}
                </span>
                {treatment.isNew ? (
                  <span className="border border-cocoa/20 px-2 py-0.5 text-caption text-cocoa/60">
                    {copy(pageCopy, "global.badge_new")}
                  </span>
                ) : null}
                {treatment.isBestSeller ? (
                  <span className="border border-cocoa/20 px-2 py-0.5 text-caption text-cocoa/60">
                    {copy(pageCopy, "global.badge_best_seller")}
                  </span>
                ) : null}
              </div>
              <h1 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                {treatment.name}
              </h1>
              <RichText value={treatment.description} className="max-w-[52ch] text-lead text-cocoa/70" />
              <div>
                <WaLink href={waHref} context="treatment">
                  {copy(pageCopy, "catalog.treatment.cta_whatsapp")}
                </WaLink>
              </div>
            </div>

            {gallery.length > 0 ? (
              <div className="image-container aspect-[4/3] w-full overflow-hidden">
                <ImageCarousel
                  images={gallery}
                  alt={treatment.name}
                  imageClassName="image-cover"
                  labels={carouselLabels(pageCopy)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </Reveal>

      <TreatmentPricing options={treatment.options} pageCopy={pageCopy} />
      <RelatedTreatments
        related={related}
        categoryName={treatment.categoryName}
        pageCopy={pageCopy}
      />
    </main>
  );
}