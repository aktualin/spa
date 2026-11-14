import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
  PublicSectionHeader,
} from "@/components/public/page-parts";
import { getMembershipTiers } from "@/lib/content/membership";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { whatsAppHref } from "@/lib/content/whatsapp";
import { MembershipTierCard } from "./membership-tier-card";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/promos/membership", {});
}

export default async function PromosMembershipPage() {
  const [memberHref, tiers, pageCopy] = await Promise.all([
    whatsAppHref("membership"),
    getMembershipTiers(),
    getPageCopy(),
  ]);

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow={copy(pageCopy, "promos.membership.hero_eyebrow")}
          title={copy(pageCopy, "promos.membership.hero_title")}
          description={copy(pageCopy, "promos.membership.hero_description")}
        >
          <div className="button-group mt-4 flex flex-wrap gap-3">
            {memberHref ? (
              <a
                href={memberHref}
                data-wa-context="membership"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                {copy(pageCopy, "promos.membership.join_label")}
              </a>
            ) : null}
            <Link
              href={copy(pageCopy, "promos.membership_menu_href") || "/menu"}
              className="btn btn-outline border-cocoa/40"
            >
              {copy(pageCopy, "promos.membership.menu_label")}
            </Link>
          </div>
        </PublicPageHeader>

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow={copy(pageCopy, "promos.membership.plans_eyebrow")}
              title={copy(pageCopy, "promos.membership.plans_title")}
            />
            {tiers.length > 0 ? (
              <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {tiers.map((tier) => (
                  <MembershipTierCard
                    key={tier.id}
                    tier={tier}
                    memberHref={memberHref}
                    pageCopy={pageCopy}
                  />
                ))}
              </ul>
            ) : (
              <div className="mt-8">
                <PublicEmptyState
                  title={copy(pageCopy, "promos.membership.empty_title")}
                  description={copy(pageCopy, "promos.membership.empty_description")}
                />
              </div>
            )}
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}