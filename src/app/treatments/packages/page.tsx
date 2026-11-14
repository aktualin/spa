import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
} from "@/components/public/page-parts";
import { PackageCard } from "@/components/public/package-card";
import { getPackages } from "@/lib/content/catalog";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { BackLink } from "../../_components/detail-parts";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/treatments/packages", {});
}

export default async function PackagesPage() {
  const [packages, pageCopy] = await Promise.all([getPackages(), getPageCopy()]);

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow={copy(pageCopy, "catalog.packages.eyebrow")}
          title={copy(pageCopy, "catalog.packages.title")}
          description={copy(pageCopy, "catalog.packages.description")}
        >
          <BackLink href="/treatments">
            {copy(pageCopy, "catalog.packages.back")}
          </BackLink>
        </PublicPageHeader>

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            {packages.length > 0 ? (
              <div className="w-layout-grid whats-new_list">
                {packages.map((pkg) => (
                  <PackageCard key={pkg.slug} pkg={pkg} />
                ))}
              </div>
            ) : (
              <PublicEmptyState
                title={copy(pageCopy, "catalog.packages.empty_title")}
                description={copy(pageCopy, "catalog.packages.empty_description")}
              />
            )}
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
