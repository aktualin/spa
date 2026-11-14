import type { Metadata } from "next";
import { Suspense } from "react";
import { DeferredNavigation } from "@/components/public/deferred-navigation";
import { Footer } from "@/components/footer";
import { fillCopy } from "@/components/copy-text";
import { getCatalogSlugs, getTreatment } from "@/lib/content/catalog";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { toPlainText } from "@/lib/domain/rich-text";
import { DetailTitleFallback } from "../../../_components/detail-parts";
import { TreatmentDetailContent } from "./treatment-detail-content";

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
  const [treatment, pageCopy] = await Promise.all([
    getTreatment(categorySlug, treatmentSlug),
    getPageCopy(),
  ]);

  if (!treatment) {
    return { title: copy(pageCopy, "catalog.treatment.not_found_title") || undefined };
  }

  return withPageSeo(`/treatments/${categorySlug}/${treatmentSlug}`, {
    title: treatment.seoTitle ?? treatment.name,
    description:
      treatment.seoDescription ??
      (toPlainText(treatment.description, 160) || null) ??
      fillCopy(
        copy(pageCopy, "catalog.seo_treatment_description") ||
          "{name} di KAMA Spa — durasi dan harga lengkap.",
        { name: treatment.name },
      ),
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
          <DetailTitleFallback title={copy(pageCopy, "catalog.treatment.loading_title")} />
        }
      >
        <TreatmentDetailContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}