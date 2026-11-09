import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "@/components/icons";
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

        <Reveal as="section" className="bg-cream-soft">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <div className="flex flex-col items-start gap-5 bg-cream-card px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12 md:py-14">
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                  {copy(pageCopy, "promos.membership_title")}
                </h2>
                <p className="max-w-[52ch] text-body text-cocoa/70">
                  {copy(pageCopy, "promos.membership_description")}
                </p>
              </div>
              <Link
                href="/promos/membership"
                className="btn btn-outline shrink-0 border-cocoa/40"
              >
                {copy(pageCopy, "promos.membership_cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
