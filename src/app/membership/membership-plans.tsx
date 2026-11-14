import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import { membershipPriceText, type MembershipTier } from "@/lib/content/membership";
import { plainTextToHtml } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { BenefitList } from "../_components/benefit-list";

/** Kartu paket membership (tier dari admin) + tombol join per kartu. */
export function MembershipPlans({
  tiers,
  joinHref,
  pageCopy,
}: {
  tiers: MembershipTier[];
  joinHref: string | null;
  pageCopy: PageCopy;
}) {
  return (
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
                  <BenefitList items={plan.benefits} />
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
  );
}