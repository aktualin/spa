import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
  PublicSectionHeader,
} from "@/components/public/page-parts";
import { PromoGrid } from "@/components/public/promos/promo-parts";
import { getActivePromos } from "@/lib/content/promos";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { CtaBanner } from "../_components/cta-banner";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/promos", {});
}

export default async function PromosPage() {
  const [promos, pageCopy] = await Promise.all([getActivePromos(), getPageCopy()]);

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow={copy(pageCopy, "promos.hero.eyebrow")}
          title={copy(pageCopy, "promos.hero.title")}
          description={copy(pageCopy, "promos.hero.description")}
        />

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow={copy(pageCopy, "promos.active.eyebrow")}
              title={copy(pageCopy, "promos.active.title")}
              description={copy(pageCopy, "promos.active.description")}
            />
            {promos.length > 0 ? (
              <PromoGrid promos={promos} />
            ) : (
              <div className="mt-8">
                <PublicEmptyState
                  title={copy(pageCopy, "promos.empty_title")}
                  description={copy(pageCopy, "promos.empty_description")}
                />
              </div>
            )}
          </div>
        </Reveal>

        <CtaBanner
          title={copy(pageCopy, "promos.membership_title")}
          description={copy(pageCopy, "promos.membership_description")}
          href={copy(pageCopy, "promos.membership_href") || "/promos/membership"}
          label={copy(pageCopy, "promos.membership_cta")}
        />
      </main>
      <Footer />
    </>
  );
}
