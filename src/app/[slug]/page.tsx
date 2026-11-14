import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeferredNavigation } from "@/components/public/deferred-navigation";
import { Footer } from "@/components/footer";
import { getPublishedPage } from "@/lib/content/pages";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { pagePath, validatePageSlug } from "@/lib/domain/page-url";
import { HeaderFallback } from "../_components/detail-parts";
import { LegalPageTemplate, StandardPageTemplate } from "./page-templates";

type StaticPageProps = {
  params: Promise<{ slug: string }>;
};

/** Halaman terbit untuk slug yang valid; null untuk slug tidak valid/draft/tidak ada. */
async function loadPage(slug: string) {
  if (validatePageSlug(slug) !== null) return null;
  return getPublishedPage(slug);
}

export async function generateMetadata({
  params,
}: StaticPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) {
    const pageCopy = await getPageCopy();
    return { title: copy(pageCopy, "pages.not_found_title") || undefined };
  }

  return withPageSeo(pagePath(slug), {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
    alternates: { canonical: pagePath(slug) },
  });
}

/*
 * Tanpa `generateStaticParams`: tabel bisa kosong dan daftar kosong
 * menggagalkan build. Slug dibaca di dalam Suspense, seperti /promos/[slug].
 */
export default async function StaticPageRoute({ params }: StaticPageProps) {
  const pageCopy = await getPageCopy();
  return (
    <>
      <DeferredNavigation />
      <Suspense
        fallback={
          <HeaderFallback
            eyebrow={copy(pageCopy, "pages.header_eyebrow")}
            title={copy(pageCopy, "pages.loading_title")}
          />
        }
      >
        <StaticPageContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

async function StaticPageContent({ params }: StaticPageProps) {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) notFound();

  if (page.template === "LEGAL") {
    return (
      <main className="main-wrapper">
        <LegalPageTemplate page={page} />
      </main>
    );
  }

  return (
    <main className="flex-1">
      <StandardPageTemplate page={page} />
    </main>
  );
}
