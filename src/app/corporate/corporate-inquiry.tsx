import { ArrowRight } from "@/components/icons";
import { CorporateInquiryForm } from "@/components/public/corporate-inquiry-form";
import { Reveal } from "@/components/reveal";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { CorporatePageContent } from "@/lib/content/corporate";
import { corporateFormLabels } from "./corporate-form-labels";

/** Bagian inquiry (formulir) + banner "get in touch" dengan kontak PIC. */
export function CorporateInquiry({
  content,
  pageCopy,
  picWhatsApp,
  privacyHref,
  captchaSiteKey,
  formAvailable,
}: {
  content: CorporatePageContent;
  pageCopy: PageCopy;
  picWhatsApp: string | null;
  privacyHref: string;
  captchaSiteKey: string | null;
  formAvailable: boolean;
}) {
  return (
    <>
      <Reveal as="section" id="inquiry" className="padding-section-global">
        <div className="padding-global">
          <div className="container-large">
            <div className="corporate-split">
              <div style={{ maxWidth: "34rem" }}>
                <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.inquiry_eyebrow")}</div>
                <h2 className="header-l">{copy(pageCopy, "corporate.inquiry_title")}</h2>
                <div className="spacer-small" />
                {copy(pageCopy, "corporate.inquiry_description") ? (
                  <p className="body-m text-color-gray">
                    {copy(pageCopy, "corporate.inquiry_description")}
                  </p>
                ) : null}
              </div>
              <div className="min-w-0">
                <CorporateInquiryForm
                  captchaSiteKey={captchaSiteKey}
                  available={formAvailable}
                  whatsappHref={picWhatsApp}
                  privacyHref={privacyHref}
                  contactEmail={content.pic.email}
                  labels={corporateFormLabels(pageCopy)}
                />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section_get-in-touch is-top-off">
        <div className="get-in-touch_container">
          <div className="get-in-touch_banner">
            <h4 className="header-l">{copy(pageCopy, "corporate.banner_title")}</h4>
            {/* Tanpa nomor PIC maupun nomor situs, tombol WA tidak dirender. */}
            {picWhatsApp ? (
              <a
                href={picWhatsApp}
                data-wa-context="default"
                target="_blank"
                rel="noopener noreferrer"
                className="button is-tertiary is-icon margin-left-auto-desktop w-inline-block"
              >
                <div>
                  {copy(pageCopy, "corporate.talk_prefix")} {content.pic.name}
                  {content.pic.phone ? ` · ${content.pic.phone}` : null}
                </div>
                <div className="button_icon w-embed">
                  <ArrowRight />
                </div>
              </a>
            ) : null}
            {content.pic.email ? (
              <a
                href={`mailto:${content.pic.email}`}
                className="button is-tertiary is-icon margin-left-auto-desktop w-inline-block"
              >
                <div>{content.pic.email}</div>
                <div className="button_icon w-embed">
                  <ArrowRight />
                </div>
              </a>
            ) : null}
          </div>
        </div>
      </Reveal>
    </>
  );
}