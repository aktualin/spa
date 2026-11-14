import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { PublicEmptyState, PublicPageHeader } from "@/components/public/page-parts";
import { TreatmentCard } from "@/components/public/treatment-card";
import { getCategory } from "@/lib/content/catalog";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { BackLink } from "../../_components/detail-parts";

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
};

/** Isi halaman kategori treatment — slug dibaca di dalam Suspense. */
export async function CategoryContent({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const [category, pageCopy] = await Promise.all([
    getCategory(categorySlug),
    getPageCopy(),
  ]);

  if (!category) notFound();

  return (
    <main className="flex-1">
      <PublicPageHeader
        eyebrow={copy(pageCopy, "catalog.treatments.eyebrow")}
        title={category.name}
        description={category.description ?? undefined}
        imageUrl={category.imageUrl}
      >
        <BackLink href="/treatments">
          {copy(pageCopy, "catalog.back_treatments")}
        </BackLink>
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
              title={copy(pageCopy, "catalog.category.empty_title")}
              description={copy(pageCopy, "catalog.category.empty_description")}
            />
          )}
        </div>
      </Reveal>
    </main>
  );
}