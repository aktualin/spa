import { Reveal } from "@/components/reveal";
import { asset } from "@/lib/asset-url";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { CorporatePageContent } from "@/lib/content/corporate";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { BenefitList } from "../_components/benefit-list";

/** Bagian In-Spa Experience: deskripsi, daftar "ideal for", dan foto lounge. */
export function CorporateInSpa({
  content,
  pageCopy,
}: {
  content: CorporatePageContent;
  pageCopy: PageCopy;
}) {
  return (
    <Reveal as="section" id="in-spa" className="padding-section-global home-locations">
      <div className="padding-global">
        <div className="container-large">
          <div className="corporate-split">
            <div>
              <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.in_spa_eyebrow")}</div>
              <h2 className="header-l">
                {copy(pageCopy, "corporate.in_spa_title")}
              </h2>
              {content.inSpaHtml ? (
                <div
                  className="kama-prose text-rich-text body-m text-color-gray w-richtext"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.inSpaHtml) }}
                />
              ) : (
                <p className="body-m text-color-gray">
                  {copy(pageCopy, "corporate.in_spa_fallback")}
                </p>
              )}
              <div className="spacer-small" />
              <h3 className="header-s">{copy(pageCopy, "corporate.ideal_for")}</h3>
              <BenefitList items={content.inSpaItems} />
            </div>
            <div>
              <div className="image-container" style={{ aspectRatio: "4 / 5" }}>
                <img
                  src={content.inSpaImageUrl || asset("img/kama/corporate/05-lounge.jpg")}
                  alt={content.inSpaImageAlt || "KAMA Spa lounge with team enjoying refreshments"}
                  className="image-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}