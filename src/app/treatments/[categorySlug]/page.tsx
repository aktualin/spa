import type { Metadata } from "next";
import { Suspense } from "react";
import { DeferredNavigation } from "@/components/public/deferred-navigation";
import { Footer } from "@/components/footer";
import { fillCopy } from "@/components/copy-text";
import { getCatalogSlugs, getCategory } from "@/lib/content/catalog";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { toPlainText } from "@/lib/domain/rich-text";
import { HeaderFallback } from "../../_components/detail-parts";
import { CategoryContent } from "./category-content";

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
};

export async function generateStaticParams() {
  const { categories } = await getCatalogSlugs();
  return categories.map((categorySlug) => ({ categorySlug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const [category, pageCopy] = await Promise.all([
    getCategory(categorySlug),
    getPageCopy(),
  ]);

  if (!category) {
    return { title: copy(pageCopy, "catalog.treatments.empty_title") || undefined };
  }

  return withPageSeo(`/treatments/${categorySlug}`, {
    title: category.seoTitle ?? category.name,
    description:
      category.seoDescription ??
      (toPlainText(category.description, 160) || null) ??
      fillCopy(
        copy(pageCopy, "catalog.seo_category_description") ||
          "{name} di KAMA Spa — durasi dan harga lengkap.",
        { name: category.name },
      ),
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  /* Slug adalah runtime data — dibaca di dalam Suspense boundary. */
  const pageCopy = await getPageCopy();
  return (
    <>
      <DeferredNavigation />
      <Suspense
        fallback={
          <HeaderFallback
            eyebrow={copy(pageCopy, "catalog.treatments.eyebrow")}
            title={copy(pageCopy, "catalog.category.loading_title")}
          />
        }
      >
        <CategoryContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}