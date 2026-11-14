import Link from "next/link";
import { ArrowRight, ChevronDown } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { MembershipProgram } from "@/lib/content/membership";

/** Benefit utama (kartu) + essential services (dropdown details). */
export function MembershipBenefits({
  membership,
  pageCopy,
}: {
  membership: MembershipProgram;
  pageCopy: PageCopy;
}) {
  return (
    <>
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
    </>
  );
}