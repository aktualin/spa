import type { Metadata } from "next";
import { Suspense } from "react";
import { DeferredNavigation } from "@/components/public/deferred-navigation";
import { Footer } from "@/components/footer";
import { getActivePromo } from "@/lib/content/promos";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { toPlainText } from "@/lib/domain/rich-text";
import { HeaderFallback } from "../../_components/detail-parts";
import { PromoDetailContent } from "./promo-detail-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [promo, pageCopy] = await Promise.all([
    getActivePromo(slug),
    getPageCopy(),
  ]);
  if (!promo) {
    return { title: copy(pageCopy, "promos.detail.not_found_title") || undefined };
  }
  return withPageSeo(`/promos/${promo.slug}`, {
    title: promo.seoTitle ?? promo.title,
    description: promo.seoDescription ?? (toPlainText(promo.description, 160) || undefined),
    openGraph: promo.bannerUrl
      ? { images: [{ url: promo.bannerUrl, alt: promo.title }] }
      : undefined,
  });
}

export default async function PromoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  /* Slug adalah runtime data — dibaca di dalam Suspense boundary. */
  const pageCopy = await getPageCopy();
  return (
    <>
      <DeferredNavigation />
      <Suspense
        fallback={
          <HeaderFallback
            eyebrow={copy(pageCopy, "promos.hero.eyebrow")}
            title={copy(pageCopy, "promos.detail.loading_title")}
          />
        }
      >
        <PromoDetailContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}