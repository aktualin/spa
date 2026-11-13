import type { Metadata } from "next";
import { withPageSeo } from "@/lib/content/seo";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight, Check, ChevronDown } from "@/components/icons";
import {
  getMembershipProgram,
  getMembershipTiers,
  membershipPriceText,
} from "@/lib/content/membership";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { plainTextToHtml } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { whatsAppHref } from "@/lib/content/whatsapp";
import { Reveal } from "@/components/reveal";
import { PublicEmptyState } from "@/components/public/page-parts";
import { RichText } from "@/components/rich-text";

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
        <Reveal as="section" className="page-hero">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">{membership.eyebrow}</div>
                <h1 className="header-xxl">{membership.title}</h1>
                <div className="spacer-medium" />
                <RichText value={membership.intro} className="body-l text-color-gray" />
                <div className="spacer-large" />
                <div className="button-group">
                  {joinHref ? (
                    <a
                      href={joinHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-wa-context="membership"
                      className="button is-tertiary sizing-grow w-inline-block"
                    >
                      <div>{copy(pageCopy, "membership.join_label")}</div>
                    </a>
                  ) : null}
                  <a href="/menu" className="button is-secondary sizing-grow w-inline-block">
                    <div>{copy(pageCopy, "membership.menu_label")}</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Main benefits */}
        <Reveal as="section" className="section_who-we-are">
          <div className="padding-global padding-section-global is-basic">
            <div className="container-large">
              <div className="section-header">
                <h2 className="header-l">{copy(pageCopy, "membership.benefits_title")}</h2>
                <div className="spacer-medium" />
                {copy(pageCopy, "membership.benefits_intro") ? (
                  <p className="body-m text-color-gray">
                    {copy(pageCopy, "membership.benefits_intro")}
                  </p>
                ) : null}
              </div>
              <div className="w-layout-grid grid_benefits">
                {membership.benefits.map((benefit) => (
                  <div key={benefit.title} className="benefits_card w-dyn-item">
                    <div className="benefits_text-wrap">
                      <h3 className="header-s">{benefit.title}</h3>
                      <div className="caption-s text-color-gray">{benefit.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Essential services */}
        <Reveal as="section" className="padding-section-global">
          <div className="padding-global">
            <div className="container-large">
              <div className="dropdowns_content">
                <div className="dropdowns_group-wrapper">
                  <h4 className="header-l">{copy(pageCopy, "membership.services_title")}</h4>
                  <RichText value={membership.servicesIntro} className="body-m text-color-gray" />
                </div>
                <div className="dropdowns_group">
                  {membership.services.map((service) => (
                    <details
                      key={service.name}
                      className="dropdown_component border-black w-dropdown"
                    >
                      <summary className="dropdown_trigger w-dropdown-toggle">
                        <div className="sizing-grow">
                          <h5 className="header-s">{service.name}</h5>
                        </div>
                        <div className="dropdown_icon show-more w-embed">
                          <ChevronDown />
                        </div>
                      </summary>
                      <div className="dropdown_content w-dropdown-list">
                        <div className="dropdown_content-inner-2">
                          <div className="body-m text-color-gray">{service.description}</div>
                          <div className="spacer-small" />
                          <Link
                            href="/contact"
                            className="button is-tertiary is-icon is-small w-inline-block"
                          >
                            <div>{copy(pageCopy, "membership.service_book_label")}</div>
                            <div className="button_icon w-embed">
                              <ArrowRight />
                            </div>
                          </Link>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Plans */}
        <Reveal as="section" className="padding-section-global home-locations">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "membership.plans_eyebrow")}</div>
                <h2 className="header-l">{copy(pageCopy, "membership.plans_title")}</h2>
              </div>
              {tiers.length === 0 ? (
                copy(pageCopy, "membership.plans_empty") ? (
                  <p className="body-m text-color-gray">
                    {copy(pageCopy, "membership.plans_empty")}
                  </p>
                ) : null
              ) : (
              <div className="w-layout-grid whats-new_list">
                {tiers.map((plan) => (
                  <div key={plan.id} className="package-card w-dyn-item">
                    <div className="package-card_body">
                      <h3 className="header-s">{plan.name}</h3>
                      <div className="price-row">
                        <span className="price-row_duration">
                          {membershipPriceText(plan)}
                        </span>
                        <span className="price-row_value">{plan.billingNote}</span>
                      </div>
                      <RichText value={plan.summary} className="body-m text-color-gray" />
                      <ul className="benefit-list">
                        {plan.benefits.map((feature) => (
                          <li key={feature} className="benefit-list_item">
                            <span className="benefit-list_icon">
                              <Check />
                            </span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {plan.terms ? (
                        <div
                          className="kama-prose caption-s text-color-gray text-rich-text"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(plainTextToHtml(plan.terms)),
                          }}
                        />
                      ) : null}
                      <div className="spacer-small" />
                      {joinHref ? (
                        <a
                          href={joinHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-wa-context="membership"
                          className="button is-tertiary is-icon w-inline-block"
                        >
                          <div>{copy(pageCopy, "membership.join_now_label")}</div>
                          <div className="button_icon w-embed">
                            <ArrowRight />
                          </div>
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        </Reveal>

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
                href="/contact"
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
