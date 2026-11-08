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
import { withPageSeo } from "@/lib/content/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/treatments", {
    title: "Treatments",
    description:
      "Seluruh treatment KAMA Spa — massage, body, facial, head & scalp, dan bath ritual, lengkap dengan durasi dan harga.",
  });
}

export default async function TreatmentsPage() {
  const categories = await getCatalog();
  const total = categories.reduce((sum, c) => sum + c.treatments.length, 0);

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow="Treatments"
          title="Setiap treatment, tanpa terburu-buru."
          description="Pilih berdasarkan kebutuhan tubuh hari ini. Durasi dan harga tertera apa adanya."
        />

        {total === 0 ? (
          <Reveal as="section" className="bg-cream">
            <div className="container-kama py-14 md:py-16 lg:py-20">
              <PublicEmptyState
                title="Katalog belum tersedia"
                description="Treatment akan muncul di sini begitu dipublikasikan dari dashboard admin."
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
                    eyebrow={`${category.treatments.length} treatment`}
                    title={category.name}
                    description={category.description ?? undefined}
                    action={{
                      label: "Lihat kategori",
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
