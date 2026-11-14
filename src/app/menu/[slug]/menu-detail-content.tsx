import { notFound } from "next/navigation";
import { carouselLabels } from "@/components/carousel-labels";
import { ImageCarousel } from "@/components/image-carousel";
import { getMenuEntry } from "@/lib/content/catalog";
import { getCatalogImagesBySlug } from "@/lib/content/content-images";
import { getPageCopy } from "@/lib/content/page-copy";
import { getSiteSettings } from "@/lib/content/site";
import { RichText } from "@/components/rich-text";
import { buildGallery } from "../../_components/gallery";
import { MenuDetailHero } from "./menu-detail-hero";
import { MenuDetailPricing } from "./menu-detail-pricing";

type TreatmentPageProps = {
  params: Promise<{ slug: string }>;
};

/** Isi detail treatment/package — slug dibaca di dalam Suspense. */
export async function MenuDetailContent({ params }: TreatmentPageProps) {
  const { slug } = await params;
  const [entry, pageCopy, settings, galleryImages] = await Promise.all([
    getMenuEntry(slug),
    getPageCopy(),
    getSiteSettings(),
    getCatalogImagesBySlug(slug),
  ]);

  if (!entry) {
    notFound();
  }

  const gallery = buildGallery(entry.image, galleryImages);

  return (
    <main className="main-wrapper">
      <MenuDetailHero entry={entry} pageCopy={pageCopy} />

      <section className="padding-section-global">
        <div className="padding-global">
          <div className="container-large">
            <div className="layout-row gap-xlarge">
              <div className="sizing-grow">
                <div className="page-hero_image image-container">
                  <ImageCarousel
                    images={gallery}
                    alt={entry.name}
                    imageClassName="image-cover"
                    eager
                    labels={carouselLabels(pageCopy)}
                  />
                </div>

                <div className="spacer-large" />

                <RichText value={entry.description} className="body-l" />

                {entry.kind === "package" ? (
                  <>
                    <div className="spacer-large" />
                    <div className="kama-prose text-rich-text header-l w-richtext">
                      <p>
                        <em>“{entry.quote}”</em>
                      </p>
                    </div>
                  </>
                ) : entry.note ? (
                  <>
                    <div className="spacer-small" />
                    <div className="eyebrow-s text-style-allcaps">{entry.note}</div>
                  </>
                ) : null}
              </div>

              <div className="sizing-grow">
                <MenuDetailPricing
                  entry={entry}
                  priceDisclaimer={settings.priceDisclaimer}
                  pageCopy={pageCopy}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}