import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import { CorporateClientLogos } from "@/components/public/corporate/corporate-client-logos";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type {
  CollabPhoto,
  CorporateClientItem,
  CorporatePageContent,
  CorporateStepItem,
} from "@/lib/content/corporate";
import { sanitizeHtml } from "@/lib/domain/sanitize";

/** Langkah kolaborasi + dokumentasi "Past Collaborations" (klien & foto). */
export function CorporateSteps({
  content,
  steps,
  clients,
  collabPhotos,
  pageCopy,
}: {
  content: CorporatePageContent;
  steps: CorporateStepItem[];
  clients: CorporateClientItem[];
  collabPhotos: CollabPhoto[];
  pageCopy: PageCopy;
}) {
  return (
    <>
      {steps.length > 0 ? (
      <Reveal as="section" className="padding-section-global">
        <div className="padding-global">
          <div className="container-large">
            <div className="section-header">
              <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.steps_eyebrow")}</div>
              <h2 className="header-l">
                {copy(pageCopy, "corporate.steps_title_prefix")} {steps.length}-{" "}
                {copy(pageCopy, "corporate.steps_title_suffix")}
              </h2>
            </div>
            <div className="w-layout-grid whats-new_list">
              {steps.map((step, idx) => (
                <div key={step.id} className="package-card w-dyn-item">
                  <div className="package-card_body">
                    <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.step_label")} {idx + 1}</div>
                    <h3 className="header-s">{step.title}</h3>
                    {step.body ? (
                      <RichText value={step.body} className="body-m text-color-gray" />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            {content.stepsHtml ? (
              <>
                <div className="spacer-medium" />
                <div
                  className="kama-prose text-rich-text body-m text-color-gray w-richtext"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.stepsHtml) }}
                />
              </>
            ) : null}
          </div>
        </div>
      </Reveal>
      ) : null}

      {collabPhotos.length > 0 || clients.length > 0 ? (
      <Reveal as="section" className="padding-section-global home-locations">
        <div className="padding-global">
          <div className="container-large">
            <div className="section-header">
              <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.collab_eyebrow")}</div>
              <h2 className="header-l">{copy(pageCopy, "corporate.collab_title")}</h2>
            </div>
            {clients.length > 0 ? <CorporateClientLogos clients={clients} /> : null}
            {collabPhotos.length > 0 ? (
            <div className="corporate-split split-3">
              {collabPhotos.map((photo, pi) => (
                <div key={`${pi}-${photo.src}`}>
                  <div className="image-container" style={{ aspectRatio: "3 / 5" }}>
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="image-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
            ) : null}
          </div>
        </div>
      </Reveal>
      ) : null}
    </>
  );
}