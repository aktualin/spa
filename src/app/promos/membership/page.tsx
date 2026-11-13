import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight, Check } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
  PublicSectionHeader,
} from "@/components/public/page-parts";
import { getMembershipTiers, membershipPriceText } from "@/lib/content/membership";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { plainTextToHtml } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { whatsAppHref } from "@/lib/content/whatsapp";
import { RichText } from "@/components/rich-text";

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
            <Link href="/menu" className="btn btn-outline border-cocoa/40">
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
                  <li key={tier.id} className="flex h-full flex-col bg-cream-card p-6">
                    <div className="flex flex-col gap-2">
                      <span className="eyebrow text-cocoa/60">{tier.name}</span>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-display text-title md:text-[1.75rem]">
                          {membershipPriceText(tier)}
                        </span>
                        {tier.billingNote ? (
                          <span className="caption-s text-cocoa/60">
                            {tier.billingNote}
                          </span>
                        ) : null}
                      </div>
                      {tier.summary ? (
                        <RichText value={tier.summary} className="text-body text-cocoa/70" />
                      ) : null}
                    </div>

                    {tier.benefits.length > 0 ? (
                      <ul className="mt-5 flex flex-col gap-2">
                        {tier.benefits.map((benefit) => (
                          <li key={benefit} className="flex items-start gap-2 text-body">
                            <span className="mt-1 shrink-0">
                              <Check className="h-4 w-4" />
                            </span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {tier.terms ? (
                      <div
                        className="kama-prose mt-5 border-t border-cocoa/15 pt-4 text-body text-cocoa/70"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(plainTextToHtml(tier.terms)) }}
                      />
                    ) : null}

                    {memberHref ? (
                      <a
                        href={memberHref}
                        data-wa-context="membership"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline mt-6 border-cocoa/40"
                      >
                        {copy(pageCopy, "promos.membership.join_now_label")}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    ) : null}
                  </li>
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
