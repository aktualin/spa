import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeferredNavigation } from "@/components/public/deferred-navigation";
import { Footer } from "@/components/footer";
import { ArrowLeft } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { TreatmentCard } from "@/components/public/treatment-card";
import { WaLink } from "@/components/public/wa-button";
import { ImageCarousel } from "@/components/image-carousel";
import { getCatalogSlugs, getCategory, getTreatment } from "@/lib/content/catalog";
import { getCatalogImagesBySlug } from "@/lib/content/content-images";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { formatDuration } from "@/lib/domain/pricing";
import { formatIdr } from "@/lib/format";
import { whatsAppHref } from "@/lib/content/whatsapp";
import { RichText } from "@/components/rich-text";
import { toPlainText } from "@/lib/domain/rich-text";

type TreatmentPageProps = {
  params: Promise<{ categorySlug: string; treatmentSlug: string }>;
};

export async function generateStaticParams() {
  const { treatments } = await getCatalogSlugs();
  return treatments;
}

export async function generateMetadata({
  params,
}: TreatmentPageProps): Promise<Metadata> {
  const { categorySlug, treatmentSlug } = await params;
  const treatment = await getTreatment(categorySlug, treatmentSlug);

  if (!treatment) {
    const pageCopy = await getPageCopy();
    return { title: copy(pageCopy, "catalog.treatment.not_found_title") || undefined };
  }

  return withPageSeo(`/treatments/${categorySlug}/${treatmentSlug}`, {
    title: treatment.seoTitle ?? treatment.name,
    description:
      treatment.seoDescription ??
      (toPlainText(treatment.description, 160) || null) ??
      `${treatment.name} di KAMA Spa — durasi dan harga lengkap.`,
  });
}

export default async function TreatmentPage({ params }: TreatmentPageProps) {
  /* Slug adalah runtime data — dibaca di dalam Suspense boundary. */
  const pageCopy = await getPageCopy();
  return (
    <>
      <DeferredNavigation />
      <Suspense
        fallback={
          <TreatmentFallback
            title={copy(pageCopy, "catalog.treatment.loading_title")}
          />
        }
      >
        <TreatmentContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

function TreatmentFallback({ title }: { title: string }) {
  return (
    <main className="flex-1">
      <Reveal as="section" className="bg-cream-soft">
        <div className="container-kama py-14 md:py-20 lg:py-24">
          <h1 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
            {title}
          </h1>
        </div>
      </Reveal>
    </main>
  );
}

async function TreatmentContent({ params }: TreatmentPageProps) {
  const { categorySlug, treatmentSlug } = await params;
  const [treatment, pageCopy, galleryImages] = await Promise.all([
    getTreatment(categorySlug, treatmentSlug),
    getPageCopy(),
    getCatalogImagesBySlug(treatmentSlug),
  ]);

  if (!treatment) notFound();

  // Gambar utama selalu jadi slide pertama; galeri admin menyusul. Satu
  // gambar dirender <img> biasa, lebih dari satu jadi carousel.
  const gallery = [
    ...(treatment.imageUrl ? [{ imageUrl: treatment.imageUrl, altText: null }] : []),
    ...galleryImages,
  ];

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
                <Link
                  href={`/treatments/${categorySlug}`}
                  className="inline-flex items-center gap-2 text-[0.9375rem] underline underline-offset-4 transition-opacity hover:opacity-70"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {treatment.categoryName}
                </Link>
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
                  />
                </div>
              ) : null}
            </div>
          </div>
        </Reveal>

        {treatment.options.length > 0 ? (
          <Reveal as="section" className="bg-cream">
            <div className="container-kama py-14 md:py-16 lg:py-20">
              <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                {copy(pageCopy, "catalog.treatment.pricing_title")}
              </h2>
              <ul className="mt-8 flex max-w-[48rem] flex-col">
                {treatment.options.map((option) => (
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
        ) : null}

        {related.length > 0 ? (
          <Reveal as="section" className="bg-cream-soft">
            <div className="container-kama py-14 md:py-16 lg:py-20">
              <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                {copy(pageCopy, "catalog.treatment.related_prefix")}{" "}
                {treatment.categoryName}
              </h2>
              <div className="w-layout-grid whats-new_list mt-8">
                {related.map((other) => (
                  <TreatmentCard key={other.slug} treatment={other} />
                ))}
              </div>
            </div>
          </Reveal>
        ) : null}
    </main>
  );
}
