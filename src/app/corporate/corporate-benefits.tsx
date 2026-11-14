import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { CorporatePageContent } from "@/lib/content/corporate";
import { BenefitList } from "../_components/benefit-list";

/** Bagian benefit + solusi partnership Corporate Wellness. */
export function CorporateBenefits({
  content,
  pageCopy,
}: {
  content: CorporatePageContent;
  pageCopy: PageCopy;
}) {
  return (
    <>
      {content.benefits.length > 0 || content.intro ? (
      <Reveal as="section" id="benefits" className="padding-section-global home-locations">
        <div className="padding-global">
          <div className="container-large">
            <div className="section-header">
              <h2 className="header-l">
                {copy(pageCopy, "corporate.benefits_title")}
              </h2>
              {content.intro ? (
                <RichText value={content.intro} className="body-m text-color-gray" />
              ) : null}
            </div>
            <div className="layout-row gap-large">
              <BenefitList items={content.benefits} className="benefit-list sizing-grow" />
              <div className="sizing-grow">
                <div className="kama-prose text-rich-text header-l w-richtext">
                  <p>
                    <em>{copy(pageCopy, "corporate.benefits_quote")}</em>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
      ) : null}

      {content.solutions.length > 0 ? (
      <Reveal as="section" className="padding-section-global">
        <div className="padding-global">
          <div className="container-large">
            <div className="section-header">
              <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.partner_eyebrow")}</div>
              <h2 className="header-l">
                {copy(pageCopy, "corporate.partner_title")}
              </h2>
              {copy(pageCopy, "corporate.partner_description") ? (
                <p className="body-m text-color-gray">
                  {copy(pageCopy, "corporate.partner_description")}
                </p>
              ) : null}
            </div>

            <div className="w-layout-grid whats-new_list">
              {content.solutions.map((sol, si) => (
                <div key={`${si}-${sol.title}`} className="package-card w-dyn-item">
                  <div className="package-card_body">
                    <h3 className="header-s">{sol.title}</h3>
                    <BenefitList items={sol.items} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
      ) : null}
    </>
  );
}