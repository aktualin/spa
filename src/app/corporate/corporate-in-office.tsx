import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { CorporatePageContent, CorporateProgramItem } from "@/lib/content/corporate";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { BenefitList } from "../_components/benefit-list";

/** Bagian In-Office Program: kartu program + catatan HTML opsional. */
export function CorporateInOffice({
  content,
  programs,
  pageCopy,
}: {
  content: CorporatePageContent;
  programs: CorporateProgramItem[];
  pageCopy: PageCopy;
}) {
  return (
    <Reveal as="section" id="in-office" className="padding-section-global">
      <div className="padding-global">
        <div className="container-large">
          <div className="section-header">
            <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.in_office_eyebrow")}</div>
            <h2 className="header-l">
              {copy(pageCopy, "corporate.in_office_title")}
            </h2>
            <p className="body-m text-color-gray">{copy(pageCopy, "corporate.in_office_sample")}</p>
          </div>

          {programs.length > 0 ? (
          <div className="w-layout-grid whats-new_list">
            {programs.map((prog) => (
              <div key={prog.id} className="package-card w-dyn-item">
                {prog.imageUrl ? (
                  <div className="package-card_image image-container">
                    <img
                      src={prog.imageUrl}
                      alt={prog.name}
                      className="image-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="package-card_body">
                  <div className="eyebrow-s text-style-allcaps">{prog.name}</div>
                  <RichText value={prog.description} className="body-m text-color-gray" />
                  <BenefitList items={prog.features} />
                </div>
              </div>
            ))}
          </div>
          ) : null}
          {content.inOfficeHtml ? (
            <>
              <div className="spacer-medium" />
              <div
                className="kama-prose text-rich-text body-m text-color-gray w-richtext"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.inOfficeHtml) }}
              />
            </>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}