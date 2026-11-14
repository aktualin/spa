import { Reveal } from "@/components/reveal";
import { asset } from "@/lib/asset-url";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { CorporatePageContent } from "@/lib/content/corporate";

/** Hero, gambar utama, dan bagian "about" Corporate Wellness. */
export function CorporateHero({
  content,
  pageCopy,
}: {
  content: CorporatePageContent;
  pageCopy: PageCopy;
}) {
  return (
    <>
      {content.heroTitle ? (
        <Reveal as="section" className="page-hero">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.hero.eyebrow")}</div>
                <h1 className="header-xxl">{content.heroTitle}</h1>
              </div>
            </div>
          </div>
        </Reveal>
      ) : null}

      <div className="padding-global">
        <div className="container-large">
          <div className="image-container" style={{ aspectRatio: "16 / 9" }}>
            <img
              src={content.heroImageUrl || asset("img/kama/corporate/01-corporate-sign.jpg")}
              alt={content.heroImageAlt || "KAMA Spa — Corporate Wellness Solutions"}
              className="image-cover"
              loading="eager"
            />
          </div>
        </div>
      </div>

      <Reveal as="section" className="padding-section-global">
        <div className="padding-global">
          <div className="container-large">
            <div className="corporate-split">
              <div>
                <div className="image-container" style={{ aspectRatio: "4 / 5" }}>
                  <img
                    src={content.aboutImageUrl || asset("img/kama/corporate/02-massage.jpg")}
                    alt={content.aboutImageAlt || "Corporate wellness session"}
                    className="image-cover"
                    loading="eager"
                  />
                </div>
              </div>
              <div style={{ maxWidth: "34rem" }}>
                <h3 className="header-l">{copy(pageCopy, "corporate.about_title")}</h3>
                <div className="spacer-small" />
                {copy(pageCopy, "corporate.about_p1") ? (
                  <p className="body-m text-color-gray">
                    {copy(pageCopy, "corporate.about_p1")}
                  </p>
                ) : null}
                <div className="spacer-small" />
                {copy(pageCopy, "corporate.about_p2") ? (
                  <p className="body-m text-color-gray">
                    {copy(pageCopy, "corporate.about_p2")}
                  </p>
                ) : null}
                <div className="spacer-medium" />
                {copy(pageCopy, "corporate.about_quote") ? (
                  <p className="body-m text-style-italic">
                    {copy(pageCopy, "corporate.about_quote")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}