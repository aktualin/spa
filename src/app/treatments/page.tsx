import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
  PublicSectionHeader,
} from "@/components/public/page-parts";
import { TreatmentCard } from "@/components/public/treatment-card";
import { getCatalog } from "@/lib/content/catalog";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/treatments", {});
}

export default async function TreatmentsPage() {
  const [categories, pageCopy] = await Promise.all([getCatalog(), getPageCopy()]);
  const total = categories.reduce((sum, c) => sum + c.treatments.length, 0);

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow={copy(pageCopy, "catalog.treatments.eyebrow")}
          title={copy(pageCopy, "catalog.treatments.title")}
          description={copy(pageCopy, "catalog.treatments.description")}
        />

        {total === 0 ? (
          <Reveal as="section" className="bg-cream">
            <div className="container-kama py-14 md:py-16 lg:py-20">
              <PublicEmptyState
                title={copy(pageCopy, "catalog.treatments.empty_title")}
                description={copy(pageCopy, "catalog.treatments.empty_description")}
              />
            </div>
          </Reveal>
        ) : (
          categories.map((category, index) =>
            category.treatments.length > 0 ? (
              <Reveal
                key={category.slug}
                as="section"
                id={category.slug}
                className={index % 2 === 0 ? "bg-cream" : "bg-cream-soft"}
              >
                <div className="container-kama py-14 md:py-16 lg:py-20">
                  <PublicSectionHeader
                    eyebrow={`${category.treatments.length} ${copy(pageCopy, "catalog.treatments.count_suffix")}`}
                    title={category.name}
                    description={category.description ?? undefined}
                    imageUrl={category.imageUrl}
                    action={{
                      label: copy(pageCopy, "catalog.treatments.category_cta"),
                      href: `/treatments/${category.slug}`,
                    }}
                  />
                  <div className="w-layout-grid whats-new_list mt-8">
                    {category.treatments.map((treatment) => (
                      <TreatmentCard
                        key={treatment.slug}
                        treatment={treatment}
                      />
                    ))}
                  </div>
                </div>
              </Reveal>
            ) : null,
          )
        )}
      </main>
      <Footer />
    </>
  );
}
