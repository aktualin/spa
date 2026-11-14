import type { Metadata } from "next";
import Link from "next/link";
import { withPageSeo } from "@/lib/content/seo";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "@/components/icons";
import { getMembershipProgram, getMembershipTiers } from "@/lib/content/membership";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { whatsAppHref } from "@/lib/content/whatsapp";
import { Reveal } from "@/components/reveal";
import { PublicEmptyState } from "@/components/public/page-parts";
import { MembershipHero } from "./membership-hero";
import { MembershipBenefits } from "./membership-benefits";
import { MembershipPlans } from "./membership-plans";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/membership", {});
}

export default async function MembershipPage() {
  const [membership, tiers, joinHref, pageCopy] = await Promise.all([
    getMembershipProgram(),
    getMembershipTiers(),
    whatsAppHref("membership"),
    getPageCopy(),
  ]);

  // Singleton belum diisi admin → empty state, bukan teks bawaan dari kode.
  if (!membership) {
    return (
      <>
        <Navigation />
        <main className="main-wrapper">
          <Reveal as="section" className="page-hero">
            <div className="padding-global">
              <div className="container-large">
                <PublicEmptyState
                  title={copy(pageCopy, "membership.empty_title")}
                  description={copy(pageCopy, "membership.empty_description")}
                />
              </div>
            </div>
          </Reveal>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="main-wrapper">
        <MembershipHero membership={membership} joinHref={joinHref} pageCopy={pageCopy} />
        <MembershipBenefits membership={membership} pageCopy={pageCopy} />
        <MembershipPlans tiers={tiers} joinHref={joinHref} pageCopy={pageCopy} />

        {membership.termsHtml ? (
          <Reveal as="section" className="padding-section-global">
            <div className="padding-global">
              <div className="container-large">
                <div className="section-header">
                  <h2 className="header-l">{copy(pageCopy, "membership.terms_title")}</h2>
                  <div className="spacer-medium" />
                  <div
                    className="kama-prose body-m text-color-gray text-rich-text"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(membership.termsHtml) }}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        ) : null}

        <Reveal as="section" className="section_get-in-touch is-top-off">
          <div className="get-in-touch_container">
            <div className="get-in-touch_banner">
              <h4 className="header-l">{copy(pageCopy, "membership.contact_title")}</h4>
              <Link
                href={copy(pageCopy, "membership.contact_href") || "/contact"}
                className="button is-tertiary is-icon margin-left-auto-desktop w-inline-block"
              >
                <div>{copy(pageCopy, "membership.contact_label")}</div>
                <div className="button_icon w-embed">
                  <ArrowRight />
                </div>
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}