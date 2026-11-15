"use client";

import { PublicPageHeader } from "@/components/public/page-header";
import { sanitizeHtml } from "@/lib/domain/sanitize";

import type { PageDraft } from "@/lib/domain/page-preview";

/** Tanggal pembaruan format Indonesia — duplikat page-templates.tsx (preview). */
function formatUpdatedAt(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

type PreviewProps = {
  draft: PageDraft;
  eyebrow: string;
  emptyBody: string;
  updatedLabel: string;
};

/** Replika klien `StandardPageTemplate` (tanpa Reveal/Navigation/Footer). */
export function StandardPreview({ draft, eyebrow, emptyBody }: PreviewProps) {
  const title = draft.title.trim() || "(tanpa judul)";
  const description = draft.seoDescription.trim() || undefined;
  return (
    <>
      <PublicPageHeader eyebrow={eyebrow} title={title} description={description} />
      <section className="bg-cream">
        <div className="container-kama py-14 md:py-16 lg:py-20">
          {draft.bodyHtml.trim() ? (
            <div
              className="kama-prose text-rich-text max-w-[70ch] text-body text-cocoa/80"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(draft.bodyHtml) }}
            />
          ) : (
            <p className="max-w-[70ch] text-body text-cocoa/70">{emptyBody}</p>
          )}
        </div>
      </section>
    </>
  );
}

/** Replika klien `LegalPageTemplate` (tanpa Reveal/Navigation/Footer). */
export function LegalPreview({ draft, emptyBody, updatedLabel }: PreviewProps) {
  const title = draft.title.trim() || "(tanpa judul)";
  const description = draft.seoDescription.trim() || undefined;
  return (
    <>
      <section className="page-hero">
        <div className="padding-global">
          <div className="container-large">
            <div className="section-header">
              <h1 className="header-xxl">{title}</h1>
              {description ? (
                <>
                  <div className="spacer-medium" />
                  <p className="body-l text-color-gray">{description}</p>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <section className="padding-section-global is-top-off">
        <div className="padding-global">
          <div className="container-large">
            <div className="w-layout-grid grid_content is-text-pages">
              <div className="body-m text-color-gray">
                <div className="eyebrow-s text-style-allcaps">{updatedLabel}</div>
                <div>{formatUpdatedAt(new Date())}</div>
              </div>
              {draft.bodyHtml.trim() ? (
                <div
                  className="kama-prose terms-n-policy w-richtext text-rich-text"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(draft.bodyHtml) }}
                />
              ) : (
                <p className="body-m text-color-gray">{emptyBody}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
