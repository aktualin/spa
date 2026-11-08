import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight, Check, ChevronDown } from "@/components/icons";
import { getMembershipProgram, getMembershipTiers } from "@/lib/content/membership";
import { plainTextToHtml } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { MEMBER_MESSAGE, waLink } from "@/lib/whatsapp";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "KAMA Membership — Rp 1,5jt per bulan. Satu essential service setiap bulan, harga anggota untuk semua treatment, diskon retail, dan benefit khusus.",
};

export default async function MembershipPage() {
  const [membership, tiers] = await Promise.all([
    getMembershipProgram(),
    getMembershipTiers(),
  ]);

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
                <p className="body-l text-color-gray">{membership.intro}</p>
                <div className="spacer-large" />
                <div className="button-group">
                  <a
                    href={waLink(MEMBER_MESSAGE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button is-tertiary sizing-grow w-inline-block"
                  >
                    <div>Join KAMA Now</div>
                  </a>
                  <a href="/menu" className="button is-secondary sizing-grow w-inline-block">
                    <div>Lihat Menu</div>
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
                <h2 className="header-l">Main Benefits</h2>
                <div className="spacer-medium" />
                <p className="body-m text-color-gray">
                  {membership.priceHeadline} Anda mendapatkan seluruh manfaat berikut, tanpa
                  komitmen jangka panjang.
                </p>
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
                  <h4 className="header-l">KAMA Essential Services</h4>
                  <div className="body-m text-color-gray">{membership.servicesIntro}</div>
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
                            <div>Book Now</div>
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
                <div className="eyebrow-s text-style-allcaps">Membership Plans</div>
                <h2 className="header-l">Pilih yang paling sesuai dengan ritme Anda.</h2>
              </div>
              <div className="w-layout-grid whats-new_list">
                {tiers.map((plan) => (
                  <div key={plan.id} className="package-card w-dyn-item">
                    <div className="package-card_body">
                      <div className="eyebrow-s text-style-allcaps">{plan.billingNote}</div>
                      <h3 className="header-s">{plan.name}</h3>
                      <div className="price-row">
                        <span className="price-row_duration">{plan.priceLabel}</span>
                        <span className="price-row_value">{plan.billingNote}</span>
                      </div>
                      <div className="body-m text-color-gray">{plan.summary}</div>
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
                          className="caption-s text-color-gray text-rich-text"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(plainTextToHtml(plan.terms)),
                          }}
                        />
                      ) : null}
                      <div className="spacer-small" />
                      <a
                        href={waLink(MEMBER_MESSAGE)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button is-tertiary is-icon w-inline-block"
                      >
                        <div>Join Now</div>
                        <div className="button_icon w-embed">
                          <ArrowRight />
                        </div>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {membership.termsHtml ? (
          <Reveal as="section" className="padding-section-global">
            <div className="padding-global">
              <div className="container-large">
                <div className="section-header">
                  <h2 className="header-l">Syarat & Ketentuan</h2>
                  <div className="spacer-medium" />
                  <div
                    className="body-m text-color-gray text-rich-text"
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
              <h4 className="header-l">Have any questions? Drop us a line.</h4>
              <Link
                href="/contact"
                className="button is-tertiary is-icon margin-left-auto-desktop w-inline-block"
              >
                <div>Get In Touch</div>
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
