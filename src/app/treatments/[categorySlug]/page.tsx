import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowLeft } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
} from "@/components/public/page-parts";
import { TreatmentCard } from "@/components/public/treatment-card";
import { getCatalogSlugs, getCategory } from "@/lib/content/catalog";
import { withPageSeo } from "@/lib/content/seo";

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
  const category = await getCategory(categorySlug);

  if (!category) {
    return { title: "Kategori tidak ditemukan" };
  }

  return withPageSeo(`/treatments/${categorySlug}`, {
    title: category.seoTitle ?? category.name,
    description:
      category.seoDescription ??
      category.description ??
      `${category.name} di KAMA Spa — durasi dan harga lengkap.`,
  });
}

export default function CategoryPage({ params }: CategoryPageProps) {
  /* Slug adalah runtime data — dibaca di dalam Suspense boundary. */
  return (
    <>
      <Navigation />
      <Suspense fallback={<CategoryFallback />}>
        <CategoryContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

function CategoryFallback() {
  return (
    <main className="flex-1">
      <PublicPageHeader eyebrow="Treatments" title="Memuat kategori…" />
    </main>
  );
}

async function CategoryContent({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = await getCategory(categorySlug);

  if (!category) notFound();

  return (
    <main className="flex-1">
        <PublicPageHeader
          eyebrow="Treatments"
          title={category.name}
          description={category.description ?? undefined}
          imageUrl={category.imageUrl}
        >
          <Link
            href="/treatments"
            className="inline-flex items-center gap-2 text-[0.9375rem] underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            <ArrowLeft className="h-4 w-4" />
            Semua treatment
          </Link>
        </PublicPageHeader>

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            {category.treatments.length > 0 ? (
              <div className="w-layout-grid whats-new_list">
                {category.treatments.map((treatment) => (
                  <TreatmentCard key={treatment.slug} treatment={treatment} />
                ))}
              </div>
            ) : (
              <PublicEmptyState
                title="Belum ada treatment di kategori ini"
                description="Daftar ini terisi otomatis begitu treatment dipublikasikan."
              />
            )}
          </div>
        </Reveal>
    </main>
  );
}
