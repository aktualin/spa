import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { WaLink } from "@/components/public/wa-button";
import { carouselLabels } from "@/components/carousel-labels";
import { ImageCarousel } from "@/components/image-carousel";
import { getPackage, getPackages } from "@/lib/content/catalog";
import { getCatalogImagesBySlug } from "@/lib/content/content-images";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { formatDuration } from "@/lib/domain/pricing";
import { formatIdr } from "@/lib/format";
import { whatsAppHref } from "@/lib/content/whatsapp";
import { RichText } from "@/components/rich-text";
import { BackLink } from "../../../_components/detail-parts";
import { buildGallery } from "../../../_components/gallery";
import { OtherPackages, PackageIncludes } from "./package-detail-sections";

type PackagePageProps = {
  params: Promise<{ slug: string }>;
};

/** Isi detail paket — slug dibaca di dalam Suspense. */
export async function PackageDetailContent({ params }: PackagePageProps) {
  const { slug } = await params;
  const [pkg, pageCopy, galleryImages] = await Promise.all([
    getPackage(slug),
    getPageCopy(),
    getCatalogImagesBySlug(slug),
  ]);

  if (!pkg) notFound();

  const gallery = buildGallery(pkg.imageUrl, galleryImages);

  const others = (await getPackages()).filter((p) => p.slug !== slug).slice(0, 3);
  const waHref = await whatsAppHref("package", {
    custom: pkg.whatsappMessage,
    values: {
      package: pkg.name,
      price: formatIdr(pkg.priceIdr),
      duration: pkg.durationMin ? formatDuration(pkg.durationMin) : null,
    },
  });

  return (
    <main className="flex-1">
      <Reveal as="section" className="bg-cream-soft">
        <div className="container-kama py-14 md:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col gap-4">
              <BackLink href="/treatments/packages">
                {copy(pageCopy, "catalog.package.back")}
              </BackLink>
              <span className="eyebrow text-cocoa/60">{copy(pageCopy, "catalog.package.eyebrow")}</span>
              <h1 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                {pkg.name}
              </h1>
              <RichText value={pkg.description} className="max-w-[52ch] text-lead text-cocoa/70" />
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                {pkg.durationMin ? (
                  <span className="text-caption text-cocoa/60">
                    {formatDuration(pkg.durationMin)}
                  </span>
                ) : null}
                <span className="font-display text-title-sm">
                  {formatIdr(pkg.priceIdr)}
                </span>
              </div>
              <div>
                <WaLink href={waHref} context="package">
                  {copy(pageCopy, "catalog.package.cta_whatsapp")}
                </WaLink>
              </div>
            </div>

            {gallery.length > 0 ? (
              <div className="image-container aspect-[4/3] w-full overflow-hidden">
                <ImageCarousel
                  images={gallery}
                  alt={pkg.name}
                  imageClassName="image-cover"
                  labels={carouselLabels(pageCopy)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </Reveal>

      <PackageIncludes items={pkg.items} pageCopy={pageCopy} />
      <OtherPackages others={others} pageCopy={pageCopy} />
    </main>
  );
}