import type { Metadata } from "next";
import { Suspense } from "react";
import { DeferredNavigation } from "@/components/public/deferred-navigation";
import { Footer } from "@/components/footer";
import { fillCopy } from "@/components/copy-text";
import { getCatalogSlugs, getPackage } from "@/lib/content/catalog";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { toPlainText } from "@/lib/domain/rich-text";
import { DetailTitleFallback } from "../../../_components/detail-parts";
import { PackageDetailContent } from "./package-detail-content";

type PackagePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { packages } = await getCatalogSlugs();
  return packages.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [pkg, pageCopy] = await Promise.all([getPackage(slug), getPageCopy()]);

  if (!pkg) {
    return { title: copy(pageCopy, "catalog.package.not_found_title") || undefined };
  }

  return withPageSeo(`/treatments/packages/${slug}`, {
    title: pkg.seoTitle ?? pkg.name,
    description:
      pkg.seoDescription ??
      (toPlainText(pkg.description, 160) || null) ??
      fillCopy(
        copy(pageCopy, "catalog.seo_package_description") ||
          "{name} di KAMA Spa — isi paket, durasi, dan harga.",
        { name: pkg.name },
      ),
  });
}

export default async function PackagePage({ params }: PackagePageProps) {
  /* Slug adalah runtime data — dibaca di dalam Suspense boundary. */
  const pageCopy = await getPageCopy();
  return (
    <>
      <DeferredNavigation />
      <Suspense
        fallback={
          <DetailTitleFallback title={copy(pageCopy, "catalog.package.loading_title")} />
        }
      >
        <PackageDetailContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}