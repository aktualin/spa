import { Reveal } from "@/components/reveal";
import { PublicPageHeader } from "@/components/public/page-parts";
import type { PublicPage } from "@/lib/content/pages";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { sanitizeHtml } from "@/lib/domain/sanitize";

/** Tanggal pembaruan dalam format Indonesia, mis. "8 November 2026". */
function formatUpdatedAt(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

/** Template umum — mengikuti halaman konten sederhana seperti /gift-card. */
export async function StandardPageTemplate({ page }: { page: PublicPage }) {
  const pageCopy = await getPageCopy();
  return (
    <>
      <PublicPageHeader
        eyebrow={copy(pageCopy, "pages.header_eyebrow")}
        title={page.title}
        description={page.seoDescription ?? undefined}
      />

      <Reveal as="section" className="bg-cream">
        <div className="container-kama py-14 md:py-16 lg:py-20">
          {page.bodyHtml ? (
            <div
              className="text-rich-text max-w-[70ch] text-body text-cocoa/80"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.bodyHtml) }}
            />
          ) : (
            <p className="max-w-[70ch] text-body text-cocoa/70">
              {copy(pageCopy, "pages.empty_body")}
            </p>
          )}
        </div>
      </Reveal>
    </>
  );
}

/** Template legal — mengikuti /privacy-policy dan /terms-conditions. */
export async function LegalPageTemplate({ page }: { page: PublicPage }) {
  const pageCopy = await getPageCopy();
  return (
    <>
      <Reveal as="section" className="page-hero">
        <div className="padding-global">
          <div className="container-large">
            <div className="section-header">
              <h1 className="header-xxl">{page.title}</h1>
              {page.seoDescription ? (
                <>
                  <div className="spacer-medium" />
                  <p className="body-l text-color-gray">{page.seoDescription}</p>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="padding-section-global is-top-off">
        <div className="padding-global">
          <div className="container-large">
            <div className="w-layout-grid grid_content is-text-pages">
              <div className="body-m text-color-gray">
                <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "pages.updated_label")}</div>
                <div>{formatUpdatedAt(page.updatedAt)}</div>
              </div>

              {page.bodyHtml ? (
                <div
                  className="terms-n-policy w-richtext text-rich-text"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.bodyHtml) }}
                />
              ) : (
                <p className="body-m text-color-gray">
                  {copy(pageCopy, "pages.empty_body")}
                </p>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}
