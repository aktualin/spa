import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeferredNavigation } from "@/components/public/deferred-navigation";
import { Footer } from "@/components/footer";
import { PublicPageHeader } from "@/components/public/page-parts";
import { getPublishedPage } from "@/lib/content/pages";
import { withPageSeo } from "@/lib/content/seo";
import { pagePath, validatePageSlug } from "@/lib/domain/page-url";
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
  if (!page) return { title: "Halaman tidak ditemukan" };

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
export default function StaticPageRoute({ params }: StaticPageProps) {
  return (
    <>
      <DeferredNavigation />
      <Suspense fallback={<StaticPageFallback />}>
        <StaticPageContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

function StaticPageFallback() {
  return (
    <main className="flex-1">
      <PublicPageHeader eyebrow="KAMA Spa" title="Memuat halaman…" />
    </main>
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
