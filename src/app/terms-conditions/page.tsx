import type { Metadata } from "next";
import { withPageSeo } from "@/lib/content/seo";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { termsConditions } from "@/data/pages";
import { Reveal } from "@/components/reveal";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/terms-conditions", {
    title: "Terms & Conditions",
    description:
      "Ketentuan & syarat KAMA Spa — reservasi, kebijakan pembatalan, pembayaran, dan perlakuan yang diharapkan dari setiap tamu.",
  });
}

export default function TermsConditionsPage() {
  return (
    <>
      <Navigation />
      <main className="main-wrapper">
        <Reveal as="section" className="page-hero">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <h1 className="header-xxl">Terms &amp; Conditions</h1>
                <div className="spacer-medium" />
                <p className="body-l text-color-gray">{termsConditions.intro}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="padding-section-global is-top-off">
          <div className="padding-global">
            <div className="container-large">
              <div className="w-layout-grid grid_content is-text-pages">
                <div className="body-m text-color-gray">
                  <div className="eyebrow-s text-style-allcaps">Last updated</div>
                  <div>1 Januari 2026</div>
                  <div className="spacer-medium" />
                  <div>
                    ketentuan di bawah ini berlaku bagi setiap kunjungan, reservasi, dan
                    penggunaan layanan KAMA Spa di Kramat Pela, Jakarta Selatan.
                  </div>
                </div>

                <div className="dropdowns_group">
                  {termsConditions.sections.map((section) => (
                    <details
                      key={section.title}
                      open
                      className="dropdown_component border-black w-dropdown"
                    >
                      <summary className="dropdown_trigger w-dropdown-toggle">
                        <div className="sizing-grow">
                          <h5 className="header-s">{section.title}</h5>
                        </div>
                      </summary>
                      <div className="dropdown_content w-dropdown-list">
                        <div className="dropdown_content-inner-2">
                          <div className="text-wrapper">
                            <div className="terms-n-policy w-richtext">
                              {section.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                              ))}
                              {section.bullets && (
                                <ul className="benefit-list">
                                  {section.bullets.map((bullet) => (
                                    <li key={bullet} className="benefit-list_item">
                                      {bullet}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
